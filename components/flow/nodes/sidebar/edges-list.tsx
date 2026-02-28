'use client';

import { useFlowStore } from '@/lib/store';
import { EdgeItem } from './edge-item';
import { AddEdge } from './add-edge';

export function EdgesList() {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) return null;

  return (
    <div className="border-t pt-4">
      <h3 className="text-sm font-medium mb-3">Outgoing Edges</h3>

      {selectedNode.data.edges.map((edge) => (
        <EdgeItem
          key={edge.id}
          edge={edge}
          nodeId={selectedNode.id}
        />
      ))}

      <AddEdge />
    </div>
  );
}
