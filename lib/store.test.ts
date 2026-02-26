import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useFlowStore, createDefaultNode } from '@/lib/store';

describe('FlowStore', () => {
  beforeEach(() => {
    const initialNode = createDefaultNode(true, 1);
    useFlowStore.setState({
      nodes: [initialNode],
      edges: [],
      selectedNodeId: null,
      startNodeId: initialNode.id,
      validationErrors: [],
    });
  });

  describe('initial state', () => {
    it('should have a default start node', () => {
      const { nodes, startNodeId } = useFlowStore.getState();
      expect(nodes).toHaveLength(1);
      expect(nodes[0]?.data.isStart).toBe(true);
      expect(startNodeId).toBe(nodes[0]?.id);
    });

    it('should have default values for other state', () => {
      const { edges, selectedNodeId, validationErrors } = useFlowStore.getState();
      expect(edges).toHaveLength(0);
      expect(selectedNodeId).toBeNull();
      expect(validationErrors).toHaveLength(0);
    });
  });

  describe('addNode', () => {
    it('should add a new node to the state', () => {
      const { addNode, nodes } = useFlowStore.getState();
      const initialCount = nodes.length;

      addNode();

      const { nodes: updatedNodes } = useFlowStore.getState();
      expect(updatedNodes).toHaveLength(initialCount + 1);
    });

    it('should add a new node with correct default values', () => {
      const { addNode } = useFlowStore.getState();
      addNode();

      const { nodes } = useFlowStore.getState();
      const newNode = nodes[nodes.length - 1];
      
      expect(newNode).toBeDefined();
      expect(newNode?.type).toBe('flowNode');
      expect(newNode?.data.label).toBeDefined();
      expect(newNode?.data.description).toBeDefined();
      expect(newNode?.data.edges).toEqual([]);
      expect(newNode?.data.isStart).toBe(false);
    });

    it('should validate after adding a node', () => {
      const { addNode } = useFlowStore.getState();

      addNode();

      const { nodes, validationErrors } = useFlowStore.getState();
      expect(nodes.length).toBeGreaterThan(0);
      expect(validationErrors).toBeDefined();
    });
  });

  describe('deleteNode', () => {
    it('should remove a node from the state', () => {
      const { nodes, addNode } = useFlowStore.getState();
      const nodeToDelete = nodes[0];

      useFlowStore.getState().deleteNode(nodeToDelete.id);

      const { nodes: updatedNodes } = useFlowStore.getState();
      expect(updatedNodes).toHaveLength(0);
    });

    it('should clear selectedNodeId when deleting selected node', () => {
      const { nodes, setSelectedNode } = useFlowStore.getState();
      const node = nodes[0];
      
      setSelectedNode(node.id);
      useFlowStore.getState().deleteNode(node.id);

      const { selectedNodeId } = useFlowStore.getState();
      expect(selectedNodeId).toBeNull();
    });

    it('should clear startNodeId when deleting start node', () => {
      const { nodes } = useFlowStore.getState();
      const startNode = nodes.find(n => n.data.isStart);

      useFlowStore.getState().deleteNode(startNode!.id);

      const { startNodeId } = useFlowStore.getState();
      expect(startNodeId).toBeNull();
    });

    it('should remove connected edges when deleting a node', () => {
      const { nodes } = useFlowStore.getState();
      const node1 = nodes[0];
      
      useFlowStore.getState().addNode();
      const { nodes: updatedNodes } = useFlowStore.getState();
      const node2 = updatedNodes[1];

      useFlowStore.getState().deleteNode(node1.id);

      const { edges } = useFlowStore.getState();
      expect(edges.filter(e => e.source === node1.id || e.target === node1.id)).toHaveLength(0);
    });
  });

  describe('updateNode', () => {
    it('should update node data', () => {
      const { nodes, updateNode } = useFlowStore.getState();
      const node = nodes[0];

      updateNode(node.id, { label: 'Updated Label', description: 'Updated description' });

      const { nodes: updatedNodes } = useFlowStore.getState();
      const updatedNode = updatedNodes.find(n => n.id === node.id);
      expect(updatedNode?.data.label).toBe('Updated Label');
      expect(updatedNode?.data.description).toBe('Updated description');
    });

    it('should validate after updating node', () => {
      const { updateNode, nodes } = useFlowStore.getState();
      const node = nodes[0];

      updateNode(node.id, { label: 'Test' });

      const { nodes: updatedNodes } = useFlowStore.getState();
      expect(updatedNodes.find(n => n.id === node.id)?.data.label).toBe('Test');
    });
  });

  describe('setSelectedNode', () => {
    it('should set selectedNodeId', () => {
      const { nodes, setSelectedNode } = useFlowStore.getState();
      const node = nodes[0];

      setSelectedNode(node.id);

      const { selectedNodeId } = useFlowStore.getState();
      expect(selectedNodeId).toBe(node.id);
    });

    it('should clear selectedNodeId when null is passed', () => {
      const { nodes, setSelectedNode } = useFlowStore.getState();
      const node = nodes[0];
      setSelectedNode(node.id);
      setSelectedNode(null);

      const { selectedNodeId } = useFlowStore.getState();
      expect(selectedNodeId).toBeNull();
    });
  });

  describe('setStartNode', () => {
    it('should set a node as start node', () => {
      const { nodes, addNode, setStartNode } = useFlowStore.getState();
      const initialStartNode = nodes.find(n => n.data.isStart);
      
      addNode();
      const { nodes: updatedNodes } = useFlowStore.getState();
      const newNode = updatedNodes[1];

      setStartNode(newNode.id);

      const { nodes: finalNodes, startNodeId } = useFlowStore.getState();
      const startNode = finalNodes.find(n => n.data.isStart);
      
      expect(startNode?.id).toBe(newNode.id);
      expect(startNodeId).toBe(newNode.id);
    });

    it('should remove start status from previous start node', () => {
      const { nodes, addNode, setStartNode } = useFlowStore.getState();
      const initialStartNode = nodes[0];
      
      addNode();
      const { nodes: updatedNodes } = useFlowStore.getState();
      const newNode = updatedNodes[1];

      setStartNode(newNode.id);

      const { nodes: finalNodes } = useFlowStore.getState();
      const oldStartNode = finalNodes.find(n => n.id === initialStartNode.id);
      
      expect(oldStartNode?.data.isStart).toBe(false);
    });
  });

  describe('edge management', () => {
    it('should add edge to node', () => {
      const { nodes, addNode, addEdgeToNode } = useFlowStore.getState();
      const node = nodes[0];
      
      addNode();
      const { nodes: updatedNodes } = useFlowStore.getState();
      const targetNode = updatedNodes[1];

      addEdgeToNode(node.id, {
        to_node_id: targetNode.id,
        condition: 'test condition',
      });

      const { nodes: finalNodes } = useFlowStore.getState();
      const updatedNode = finalNodes.find(n => n.id === node.id);
      
      expect(updatedNode?.data.edges).toHaveLength(1);
      expect(updatedNode?.data.edges[0]?.condition).toBe('test condition');
    });

    it('should remove edge from node', () => {
      const { nodes, addNode, addEdgeToNode, removeEdgeFromNode } = useFlowStore.getState();
      const node = nodes[0];
      
      addNode();
      const { nodes: updatedNodes } = useFlowStore.getState();
      const targetNode = updatedNodes[1];

      addEdgeToNode(node.id, {
        to_node_id: targetNode.id,
        condition: 'test',
      });

      removeEdgeFromNode(node.id, 0);

      const { nodes: finalNodes } = useFlowStore.getState();
      const updatedNode = finalNodes.find(n => n.id === node.id);
      
      expect(updatedNode?.data.edges).toHaveLength(0);
    });

    it('should update edge in node', () => {
      const { nodes, addNode, addEdgeToNode, updateEdgeInNode } = useFlowStore.getState();
      const node = nodes[0];
      
      addNode();
      const { nodes: updatedNodes } = useFlowStore.getState();
      const targetNode = updatedNodes[1];

      addEdgeToNode(node.id, {
        to_node_id: targetNode.id,
        condition: 'original',
      });

      updateEdgeInNode(node.id, 0, {
        to_node_id: targetNode.id,
        condition: 'updated',
      });

      const { nodes: finalNodes } = useFlowStore.getState();
      const updatedNode = finalNodes.find(n => n.id === node.id);
      
      expect(updatedNode?.data.edges[0]?.condition).toBe('updated');
    });
  });

  describe('validation', () => {
    it('should validate node IDs are unique', () => {
      const { nodes, updateNode } = useFlowStore.getState();
      const node1 = nodes[0];
      
      useFlowStore.getState().addNode();
      const { nodes: updatedNodes } = useFlowStore.getState();
      const node2 = updatedNodes[1];

      updateNode(node2.id, { id: node1.data.id });

      const { validationErrors } = useFlowStore.getState();
      const duplicateIdError = validationErrors.find(e => e.field === 'id');
      
      expect(duplicateIdError).toBeDefined();
      expect(duplicateIdError?.message).toContain('Duplicate');
    });

    it('should validate description is required', () => {
      const { updateNode, validate } = useFlowStore.getState();
      const { nodes } = useFlowStore.getState();
      const node = nodes[0];

      updateNode(node.id, { description: '' });

      const { validationErrors } = useFlowStore.getState();
      const descriptionError = validationErrors.find(e => e.field === 'description');
      
      expect(descriptionError).toBeDefined();
      expect(descriptionError?.message).toBe('Description is required');
    });

    it('should validate start node exists', () => {
      const { nodes } = useFlowStore.getState();
      const startNode = nodes.find(n => n.data.isStart);
      useFlowStore.getState().deleteNode(startNode!.id);

      const { validationErrors } = useFlowStore.getState();
      const startError = validationErrors.find(e => e.field === 'start');
      
      expect(startError).toBeDefined();
      expect(startError?.message).toBe('Start node must exist');
    });

    it('should return true when validation passes', () => {
      const { validate } = useFlowStore.getState();
      
      const result = validate();
      
      expect(result).toBe(true);
    });
  });

  describe('importFlow', () => {
    it('should import flow from JSON', () => {
      const importedNodes = [
        {
          id: 'test-node-1',
          type: 'flowNode',
          position: { x: 0, y: 0 },
          data: {
            id: 'node_1',
            description: 'Test description',
            prompt: 'Test prompt',
            edges: [],
            isStart: true,
            label: 'Test Node',
          },
        },
      ];
      const importedEdges = [
        {
          id: 'test-edge-1',
          source: 'test-node-1',
          target: 'test-node-2',
          type: 'default',
        },
      ];

      useFlowStore.getState().importFlow({
        nodes: importedNodes as any,
        edges: importedEdges as any,
      });

      const { nodes, edges, startNodeId } = useFlowStore.getState();
      
      expect(nodes).toHaveLength(1);
      expect(nodes[0]?.data.label).toBe('Test Node');
      expect(startNodeId).toBe('test-node-1');
      expect(edges).toHaveLength(1);
    });
  });

  describe('getFlowJson', () => {
    it('should return valid JSON', () => {
      const { getFlowJson } = useFlowStore.getState();
      
      const json = getFlowJson();
      
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should include nodes and start_node_id', () => {
      const { getFlowJson, nodes, startNodeId } = useFlowStore.getState();
      
      const json = JSON.parse(getFlowJson());
      
      expect(json.nodes).toHaveLength(nodes.length);
      expect(json.start_node_id).toBe(startNodeId);
    });
  });

  describe('onConnect', () => {
    it('should add edge when connecting nodes', () => {
      const { onConnect, addNode } = useFlowStore.getState();
      
      addNode();
      const { nodes } = useFlowStore.getState();
      
      onConnect({
        source: nodes[0].id,
        target: nodes[1].id,
        sourceHandle: null,
        targetHandle: null,
      });

      const { edges } = useFlowStore.getState();
      
      expect(edges).toHaveLength(1);
      expect(edges[0]?.source).toBe(nodes[0].id);
      expect(edges[0]?.target).toBe(nodes[1].id);
    });

    it('should add edge to node data when connecting', () => {
      const { onConnect, addNode } = useFlowStore.getState();
      
      addNode();
      const { nodes } = useFlowStore.getState();
      
      onConnect({
        source: nodes[0].id,
        target: nodes[1].id,
        sourceHandle: null,
        targetHandle: null,
      });

      const { nodes: updatedNodes } = useFlowStore.getState();
      const sourceNode = updatedNodes.find(n => n.id === nodes[0].id);
      
      expect(sourceNode?.data.edges).toHaveLength(1);
      expect(sourceNode?.data.edges[0]?.to_node_id).toBe(nodes[1].id);
    });
  });
});
