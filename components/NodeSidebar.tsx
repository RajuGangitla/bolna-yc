'use client';

import { useFlowStore } from '@/lib/store';
import { FlowEdge } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NodeSidebarContentProps {
  onClose: () => void;
}

export function NodeSidebarContent({ onClose }: NodeSidebarContentProps) {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);
  const updateNode = useFlowStore((state) => state.updateNode);
  const addEdgeToNode = useFlowStore((state) => state.addEdgeToNode);
  const removeEdgeFromNode = useFlowStore((state) => state.removeEdgeFromNode);
  const updateEdgeInNode = useFlowStore((state) => state.updateEdgeInNode);
  const validationErrors = useFlowStore((state) => state.validationErrors);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const [newEdgeTarget, setNewEdgeTarget] = useState('');
  const [newEdgeCondition, setNewEdgeCondition] = useState('');

  useEffect(() => {
    setNewEdgeTarget('');
    setNewEdgeCondition('');
  }, [selectedNodeId]);

  if (!selectedNode) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground text-center py-8">
          Select a node to edit
        </p>
      </div>
    );
  }

  const nodeErrors = validationErrors.filter((e) => e.nodeId === selectedNode.id);

  const handleAddEdge = () => {
    if (newEdgeTarget) {
      addEdgeToNode(selectedNode.id, {
        to_node_id: newEdgeTarget,
        condition: newEdgeCondition,
      });
      toast.success('Edge added');
      setNewEdgeTarget('');
      setNewEdgeCondition('');
    }
  };

  const handleUpdateEdge = (index: number, field: keyof FlowEdge, value: string) => {
    const edge = selectedNode.data.edges[index];
    updateEdgeInNode(selectedNode.id, index, { ...edge, [field]: value });
  };

  const handleDeleteEdge = (index: number) => {
    removeEdgeFromNode(selectedNode.id, index);
    toast.success('Edge removed');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-name">Node Name</Label>
          <Input
            id="node-name"
            type="text"
            value={selectedNode.data.label}
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            placeholder="Enter node name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-id">Node ID</Label>
          <Input
            id="node-id"
            type="text"
            value={selectedNode.data.id}
            onChange={(e) => updateNode(selectedNode.id, { id: e.target.value })}
            placeholder="Unique node ID"
            className={cn(
              nodeErrors.some((e) => e.field === 'id') && 'border-destructive'
            )}
          />
          {nodeErrors.some((e) => e.field === 'id') && (
            <p className="text-destructive text-xs">
              {nodeErrors.find((e) => e.field === 'id')?.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="node-description"
            value={selectedNode.data.description}
            onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
            placeholder="Describe this node"
            rows={3}
            className={cn(
              nodeErrors.some((e) => e.field === 'description') && 'border-destructive'
            )}
          />
          {nodeErrors.some((e) => e.field === 'description') && (
            <p className="text-destructive text-xs">
              {nodeErrors.find((e) => e.field === 'description')?.message}
            </p>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Outgoing Edges</h3>

          {selectedNode.data.edges.map((edge, index) => (
            <div key={index} className="mb-4 p-3 bg-muted rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Edge to: {nodes.find(n => n.id === edge.to_node_id)?.data.label || 'Unknown'}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteEdge(index)}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Target Node</Label>
                <Select
                  value={edge.to_node_id}
                  onValueChange={(value) => handleUpdateEdge(index, 'to_node_id', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select target node" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes
                      .filter((n) => n.id !== selectedNode.id)
                      .map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.data.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">When to take this edge?</Label>
                <Input
                  type="text"
                  value={edge.condition}
                  onChange={(e) => handleUpdateEdge(index, 'condition', e.target.value)}
                  placeholder="e.g., if user says 'hello'"
                  className="w-full"
                />
              </div>
            </div>
          ))}

          {nodes.length <= 1 ? (
            <p className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
              Add more nodes to create connections
            </p>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Add New Edge</Label>
              <Select value={newEdgeTarget} onValueChange={setNewEdgeTarget}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes
                    .filter((n) => n.id !== selectedNode.id)
                    .map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.data.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                value={newEdgeCondition}
                onChange={(e) => setNewEdgeCondition(e.target.value)}
                placeholder="e.g., if user says 'hello'"
                className="w-full"
              />
              <Button
                onClick={handleAddEdge}
                disabled={!newEdgeTarget}
                className="w-full gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Edge
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
