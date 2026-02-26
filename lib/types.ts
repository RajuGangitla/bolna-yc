import { Node, Edge as ReactFlowEdge } from '@xyflow/react';

export interface FlowEdge {
  to_node_id: string;
  condition: string;
  parameters?: Record<string, string>;
}

export interface FlowNodeData extends Record<string, unknown> {
  id: string;
  description: string;
  prompt: string;
  edges: FlowEdge[];
  isStart: boolean;
  label: string;
}

export type FlowNode = Node<FlowNodeData>;

export type FlowReactEdge = ReactFlowEdge;

export interface ValidationError {
  nodeId?: string;
  field: string;
  message: string;
}

export interface FlowState {
  nodes: FlowNode[];
  edges: FlowReactEdge[];
  selectedNodeId: string | null;
  startNodeId: string | null;
  validationErrors: ValidationError[];
  
  addNode: () => void;
  deleteNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: Partial<FlowNodeData>) => void;
  setSelectedNode: (nodeId: string | null) => void;
  setStartNode: (nodeId: string) => void;
  addEdgeToNode: (nodeId: string, edge: FlowEdge) => void;
  removeEdgeFromNode: (nodeId: string, edgeIndex: number) => void;
  updateEdgeInNode: (nodeId: string, edgeIndex: number, edge: FlowEdge) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  validate: () => boolean;
  importFlow: (flow: { nodes: FlowNode[]; edges: FlowReactEdge[] }) => void;
  getFlowJson: () => string;
}

export interface FlowJson {
  nodes: FlowNodeData[];
  start_node_id: string;
}
