'use client';

import { useFlowStore } from '@/lib/store';
import { FlowEdge } from '@/lib/types';
import { X, Plus, Trash2, Play } from 'lucide-react';
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
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const setStartNode = useFlowStore((state) => state.setStartNode);
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

  const handleDeleteNode = () => {
    deleteNode(selectedNode.id);
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Edit Node</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-label">Node Label</Label>
          <Input
            id="node-label"
            type="text"
            value={selectedNode.data.label}
            onChange={(e) => updateNode(selectedNode.id, { label: e.target.value })}
            placeholder="Enter node label"
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

        <div className="space-y-2">
          <Label htmlFor="node-prompt">Prompt</Label>
          <Textarea
            id="node-prompt"
            value={selectedNode.data.prompt}
            onChange={(e) => updateNode(selectedNode.id, { prompt: e.target.value })}
            placeholder="Enter prompt for this node"
            rows={4}
          />
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <Label>Set as Start Node</Label>
            <Button
              variant={selectedNode.data.isStart ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStartNode(selectedNode.id)}
              className="gap-1"
            >
              <Play className="w-3 h-3" />
              {selectedNode.data.isStart ? 'Started' : 'Set Start'}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t space-y-3">
          <h3 className="text-sm font-medium">Outgoing Edges</h3>

          {selectedNode.data.edges.map((edge, index) => (
            <div key={index} className="p-3 bg-muted rounded-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Edge {index + 1}</span>
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
                  <SelectTrigger>
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
                <Label className="text-xs">Condition</Label>
                <Input
                  type="text"
                  value={edge.condition}
                  onChange={(e) => handleUpdateEdge(index, 'condition', e.target.value)}
                  placeholder="e.g., if user says 'hello'"
                />
              </div>
            </div>
          ))}

          <div className="p-3 border border-dashed rounded-md space-y-2">
            <h4 className="text-xs font-medium">Add New Edge</h4>
            <Select value={newEdgeTarget} onValueChange={setNewEdgeTarget}>
              <SelectTrigger>
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
              placeholder="Condition (optional)"
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
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          onClick={handleDeleteNode}
          variant="destructive"
          className="w-full gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Node
        </Button>
      </div>
    </div>
  );
}
