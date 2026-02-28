import { create } from 'zustand';
import { 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge,
  Connection,
  NodeChange,
  EdgeChange 
} from '@xyflow/react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { FlowState, FlowNode, FlowNodeData, FlowReactEdge, ValidationError, FlowJson, FlowEdge } from './types';
import { nodeVariants } from '@/components/flow/nodes/node-variants';

const createInitialNode = (): FlowNode => {
  const id = uuidv4();
  const type = 'trigger';
  return {
    id,
    type: 'flowNode',
    position: { x: 400, y: 300 },
    data: {
      id,
      type,
      description: nodeVariants[type]?.description || '',
      edges: [],
      isStart: true,
      label: 'Trigger 1',
    },
  };
};

const NODE_LABELS: Record<string, string> = {
  trigger: 'Trigger',
  agent: 'Agent',
  action: 'Action',
};

const getNodeLabel = (type: string, existingNodes: FlowNode[]): string => {
  const typeNodes = existingNodes.filter(n => n.data.type === type);
  const count = typeNodes.length + 1;
  return `${NODE_LABELS[type]} ${count}`;
};

export const createDefaultNode = (isStart: boolean = false, existingNodes: FlowNode[] = []): FlowNode => {
  const id = uuidv4();
  const defaultType = 'agent';
  const label = getNodeLabel(defaultType, existingNodes);
  
  let position = { x: 100, y: 100 };
  
  if (existingNodes.length > 0) {
    const lastNode = existingNodes[existingNodes.length - 1];
    position = {
      x: lastNode.position.x + 350,
      y: lastNode.position.y + (Math.random() * 100 - 50),
    };
  }
  
  return {
    id,
    type: 'flowNode',
    position,
    data: {
      id,
      type: defaultType,
      description: nodeVariants[defaultType]?.description || '',
      edges: [],
      isStart,
      label,
    },
  };
};

const initialNode = createInitialNode();

const initialState = {
  nodes: [initialNode],
  edges: [] as FlowReactEdge[],
  selectedNodeId: null as string | null,
  startNodeId: initialNode.id,
  validationErrors: [] as ValidationError[],
};

let validateTimeout: ReturnType<typeof setTimeout> | null = null;

export const useFlowStore = create<FlowState>((set, get) => ({
  ...initialState,

  addNode: () => {
    const state = get();
    const newNode = createDefaultNode(false, state.nodes);
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    toast.success('Node added', { description: newNode.data.label });
    if (validateTimeout) clearTimeout(validateTimeout);
    validateTimeout = setTimeout(() => get().validate(), 300);
  },

  deleteNode: (nodeId: string) => {
    const node = get().nodes.find(n => n.id === nodeId);
    set((state) => ({
      nodes: state.nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => ({
          // ✅ Remove any data.edges pointing to the deleted node
          ...n,
          data: {
            ...n.data,
            edges: n.data.edges.filter((e) => e.to_node_id !== nodeId),
          },
        })),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      startNodeId: state.startNodeId === nodeId ? null : state.startNodeId,
    }));
    toast.success('Node deleted', { description: node?.data.label });
    get().validate();
  },

  updateNode: (nodeId: string, data: Partial<FlowNodeData>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
    get().validate();
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  setStartNode: (nodeId: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => ({
        ...node,
        data: { ...node.data, isStart: node.id === nodeId },
      })),
      startNodeId: nodeId,
    }));
    get().validate();
  },

  addEdgeToNode: (nodeId: string, edge: FlowEdge) => {
    const existingEdge = useFlowStore.getState().edges.find(
      (e) => e.source === nodeId && e.target === edge.to_node_id
    );
    if (existingEdge) {
      toast.error('Edge already exists between these nodes');
      return;
    }

    set((state) => {
      const sourceNode = state.nodes.find((n) => n.id === nodeId);
      if (!sourceNode) return state;

      const edgeId = uuidv4();
      const newReactEdge: FlowReactEdge = {
        id: edgeId,
        source: nodeId,
        target: edge.to_node_id,
        type: 'animated',
        animated: true,
        sourceHandle: edge.sourcePosition === 'left' ? 'source-left' : 'source-right',
        targetHandle: edge.targetPosition === 'right' ? 'target-right' : 'target-left',
      };

      const newEdge = { ...edge, id: edgeId };
      
      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, edges: [...node.data.edges, newEdge] } }
            : node
        ),
        edges: [...state.edges, newReactEdge],
      };
    });
  },

  removeEdgeFromNode: (nodeId: string, edgeId: string) => {
    set((state) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) return state;
      
      const edgeToRemove = node.data.edges.find((e) => e.id === edgeId);
      if (!edgeToRemove) return state;

      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, edges: node.data.edges.filter((e) => e.id !== edgeId) } }
            : node
        ),
        edges: state.edges.filter(
          (e) => e.id !== edgeId
        ),
      };
    });
    get().validate();
  },

  updateEdgeInNode: (nodeId: string, edgeId: string, edge: FlowEdge) => {
    set((state) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) return state;
      
      const edgeIndex = node.data.edges.findIndex((e) => e.id === edgeId);
      if (edgeIndex === -1) return state;
      
      const existingEdge = state.edges.find(
        (e) => e.source === nodeId && e.target === edge.to_node_id
      );
      
      const updatedEdges = existingEdge
        ? state.edges.map((e) =>
            e.source === nodeId && e.target === edge.to_node_id
              ? { 
                  ...e, 
                  sourceHandle: edge.sourcePosition === 'left' ? 'source-left' : 'source-right',
                  targetHandle: edge.targetPosition === 'right' ? 'target-right' : 'target-left',
                }
              : e
          )
        : state.edges;

      return {
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  edges: node.data.edges.map((e, i) => (i === edgeIndex ? edge : e)),
                },
              }
            : node
        ),
        edges: updatedEdges,
      };
    });
  },

  onNodesChange: (changes: NodeChange[]) => {
    set((state) => {
      const deletedNodeIds = new Set<string>();
      changes.forEach((change) => {
        if (change.type === 'remove') deletedNodeIds.add(change.id);
      });
  
      // First clean data.edges on ALL current nodes (before removal)
      const cleanedNodes = state.nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          edges: deletedNodeIds.size > 0
            ? node.data.edges.filter((edge) => !deletedNodeIds.has(edge.to_node_id))
            : node.data.edges,
        },
      }));
  
      // Then apply positional/selection/removal changes on top
      const updatedNodes = applyNodeChanges(changes, cleanedNodes) as FlowNode[];
  
      const cleanedEdges = deletedNodeIds.size > 0
        ? state.edges.filter(
            (e) => !deletedNodeIds.has(e.source) && !deletedNodeIds.has(e.target)
          )
        : state.edges;
  
      return { nodes: updatedNodes, edges: cleanedEdges };
    });
    get().validate();
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => {
      const updatedEdges = applyEdgeChanges(changes, state.edges);
      
      // Clean up edges from node data when edges are deleted
      const deletedEdgeIds = new Set<string>();
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deletedEdgeIds.add(change.id);
        }
      });
      
      if (deletedEdgeIds.size > 0) {
        const deletedEdges = state.edges.filter((e) =>
          deletedEdgeIds.has(e.id)
        );
        
        const cleanedNodes = state.nodes.map((node) => {
          const edgesToRemove = deletedEdges.filter(
            (edge) => edge.source === node.id
          );
          
          if (edgesToRemove.length === 0) {
            return node;
          }
          
          const targetIds = new Set(edgesToRemove.map((e) => e.target));
          return {
            ...node,
            data: {
              ...node.data,
              edges: node.data.edges.filter(
                (edge) => !targetIds.has(edge.to_node_id)
              ),
            },
          };
        });
        
        return { edges: updatedEdges, nodes: cleanedNodes };
      }
      
      return { edges: updatedEdges };
    });
    get().validate();
  },

  onConnect: (connection: Connection) => {
    if (connection.source === connection.target) {
      toast.error('Cannot connect a node to itself');
      return;
    }

    set((state) => {
      const edgeId = uuidv4();
      const newEdges = addEdge(
        { ...connection, id: edgeId, type: 'animated', animated: true },
        state.edges
      );
      
      const sourceNode = state.nodes.find(n => n.id === connection.source);
      if (sourceNode) {
        const newEdge: FlowEdge = {
          id: edgeId,
          to_node_id: connection.target!,
          condition: '',
        };
        const updatedNodes = state.nodes.map(node => {
          if (node.id === connection.source) {
            return {
              ...node,
              data: {
                ...node.data,
                edges: [...node.data.edges, newEdge]
              }
            };
          }
          return node;
        });
        return { edges: newEdges, nodes: updatedNodes };
      }
      
      return { edges: newEdges };
    });
  },

  validate: () => {
    const { nodes, edges, startNodeId } = get();
    const errors: ValidationError[] = [];

    const nodeIds = new Set<string>();
    nodes.forEach((node) => {
      if (nodeIds.has(node.data.id)) {
        errors.push({
          nodeId: node.id,
          field: 'id',
          message: 'Duplicate node ID',
        });
      }
      nodeIds.add(node.data.id);

      if (!node.data.label || node.data.label.trim() === '') {
        errors.push({
          nodeId: node.id,
          field: 'label',
          message: 'Node name is required',
        });
      }

      if (!node.data.description || node.data.description.trim() === '') {
        errors.push({
          nodeId: node.id,
          field: 'description',
          message: 'Description is required',
        });
      }
    });

    if (!startNodeId) {
      errors.push({
        field: 'start',
        message: 'Start node must exist',
      });
    }

    const connectedNodeIds = new Set<string>();
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const disconnectedNodes = nodes.filter((node) => {
      if (node.data.isStart) return false;
      return !connectedNodeIds.has(node.id);
    });

    disconnectedNodes.forEach((node) => {
      errors.push({
        nodeId: node.id,
        field: 'disconnected',
        message: `Disconnected node: ${node.data.label || node.id}`,
      });
    });

    set({ validationErrors: errors });
    return errors.length === 0;
  },

  importFlow: (flow: { nodes: FlowNode[]; edges: FlowReactEdge[] }) => {
    const startNode = flow.nodes.find(n => n.data.isStart);
    set({
      nodes: flow.nodes,
      edges: flow.edges,
      startNodeId: startNode?.id || null,
      selectedNodeId: null,
    });
    toast.success('Flow imported', { description: `${flow.nodes.length} nodes loaded` });
    get().validate();
  },

  getFlowJson: (): string => {
    const { nodes, edges, startNodeId } = get();
    const flowJson = {
      nodes: nodes.map((node) => ({
        id: node.data.id,
        type: node.data.type,
        description: node.data.description,
        edges: node.data.edges,
        isStart: node.data.isStart,
        label: node.data.label,
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      start_node_id: startNodeId || '',
    };
    return JSON.stringify(flowJson, null, 2);
  },
}));
