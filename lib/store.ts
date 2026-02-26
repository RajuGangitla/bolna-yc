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
import { FlowState, FlowNode, FlowNodeData, FlowReactEdge, ValidationError, FlowJson, FlowEdge } from './types';

const generateId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createInitialNode = (): FlowNode => {
  const id = generateId();
  return {
    id,
    type: 'flowNode',
    position: { x: 100, y: 100 },
    data: {
      id: id,
      description: 'Start node description',
      prompt: '',
      edges: [],
      isStart: true,
      label: 'Start Node',
    },
  };
};

export const createDefaultNode = (isStart: boolean = false, index: number = 1): FlowNode => {
  const id = generateId();
  return {
    id,
    type: 'flowNode',
    position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
    data: {
      id,
      description: 'Start node description',
      prompt: '',
      edges: [],
      isStart,
      label: `Node ${index}`,
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
    const newNode = createDefaultNode(false, get().nodes.length + 1);
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
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, edges: [...node.data.edges, edge] } }
          : node
      ),
    }));
  },

  removeEdgeFromNode: (nodeId: string, edgeIndex: number) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, edges: node.data.edges.filter((_, i) => i !== edgeIndex) } }
          : node
      ),
    }));
    get().validate();
  },

  updateEdgeInNode: (nodeId: string, edgeIndex: number, edge: FlowEdge) => {
    set((state) => ({
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
    }));
  },

  onNodesChange: (changes: NodeChange[]) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes) as FlowNode[],
    }));
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection: Connection) => {
    set((state) => {
      const newEdges = addEdge(
        { ...connection, type: 'animated', animated: true },
        state.edges
      );
      
      const sourceNode = state.nodes.find(n => n.id === connection.source);
      if (sourceNode) {
        const newEdge: FlowEdge = {
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
          message: `Duplicate node ID: ${node.data.id}`,
        });
      }
      nodeIds.add(node.data.id);

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
    const { nodes, startNodeId } = get();
    const flowJson: FlowJson = {
      nodes: nodes.map((node) => ({
        id: node.id,
        description: node.data.description,
        prompt: node.data.prompt,
        edges: node.data.edges,
        isStart: node.data.isStart,
        label: node.data.label,
      })),
      start_node_id: startNodeId || '',
    };
    return JSON.stringify(flowJson, null, 2);
  },
}));
