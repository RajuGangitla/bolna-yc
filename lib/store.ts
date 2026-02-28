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
      description: NODE_DESCRIPTIONS[type],
      edges: [],
      isStart: true,
      label: 'Trigger 1',
    },
  };
};

const NODE_TYPES = ['trigger', 'agent', 'action'] as const;

const NODE_LABELS: Record<string, string> = {
  trigger: 'Trigger',
  agent: 'Agent',
  action: 'Action',
};

const NODE_DESCRIPTIONS: Record<string, string> = {
  trigger: 'Entry point that starts the conversation flow',
  agent: 'AI agent that processes and generates responses',
  action: 'Performs a specific task or function',
};

let nodeCounter = {
  trigger: 1,
  agent: 1,
  action: 1,
};

export const createDefaultNode = (isStart: boolean = false): FlowNode => {
  const id = uuidv4();
  const randomType = NODE_TYPES[Math.floor(Math.random() * NODE_TYPES.length)];
  const label = `${NODE_LABELS[randomType]} ${nodeCounter[randomType as keyof typeof nodeCounter]++}`;
  
  return {
    id,
    type: 'flowNode',
    position: { x: Math.random() * 300 + 500, y: Math.random() * 400 + 100 },
    data: {
      id,
      type: randomType,
      description: NODE_DESCRIPTIONS[randomType],
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

export const useFlowStore = create<FlowState>((set, get) => ({
  ...initialState,

  addNode: () => {
    const newNode = createDefaultNode(false);
    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
    toast.success('Node added', { description: newNode.data.label });
    get().validate();
  },

  deleteNode: (nodeId: string) => {
    const node = get().nodes.find(n => n.id === nodeId);
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
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
      
      toast.success('Edge created successfully');
      
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
          (e) => !(e.source === nodeId && e.target === edgeToRemove.to_node_id)
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
      const updatedNodes = applyNodeChanges(changes, state.nodes) as FlowNode[];
      
      // Clean up edges from node data when nodes are deleted
      const deletedNodeIds = new Set<string>();
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deletedNodeIds.add(change.id);
        }
      });
      
      // Remove edges that reference deleted nodes
      const cleanedNodes = updatedNodes.map((node) => {
        if (deletedNodeIds.has(node.id)) {
          return node;
        }
        return {
          ...node,
          data: {
            ...node.data,
            edges: node.data.edges.filter(
              (edge) => !deletedNodeIds.has(edge.to_node_id)
            ),
          },
        };
      });
      
      return { nodes: cleanedNodes };
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
    set((state) => {
      const newEdges = addEdge(
        { ...connection, type: 'animated', animated: true },
        state.edges
      );
      
      const sourceNode = state.nodes.find(n => n.id === connection.source);
      if (sourceNode) {
        const edgeId = `e_${connection.source}_${connection.target}_${Date.now()}`;
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
        toast.success('Connection created');
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
    const { nodes, startNodeId } = get();
    const flowJson: FlowJson = {
      nodes: nodes.map((node) => ({
        id: node.data.id,
        type: node.data.type,
        description: node.data.description,
        edges: node.data.edges,
        isStart: node.data.isStart,
        label: node.data.label,
      })),
      start_node_id: startNodeId || '',
    };
    return JSON.stringify(flowJson, null, 2);
  },
}));
