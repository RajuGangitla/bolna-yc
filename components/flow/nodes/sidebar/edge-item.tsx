'use client';

import { useFlowStore } from '@/lib/store';
import { FlowEdge } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EdgeItemProps {
  edge: FlowEdge;
  nodeId: string;
}

export function EdgeItem({ edge, nodeId }: EdgeItemProps) {
  const nodes = useFlowStore((state) => state.nodes);
  const selectedNode = nodes.find((n) => n.id === nodeId);
  const removeEdgeFromNode = useFlowStore((state) => state.removeEdgeFromNode);
  const updateEdgeInNode = useFlowStore((state) => state.updateEdgeInNode);

  const handleUpdateEdge = (field: keyof FlowEdge, value: string) => {
    if (selectedNode && edge.id) {
      updateEdgeInNode(nodeId, edge.id, { ...edge, [field]: value });
    }
  };

  const handleDeleteEdge = () => {
    if (edge.id) {
      removeEdgeFromNode(nodeId, edge.id);
      toast.success('Edge removed');
    }
  };

  const targetNode = nodes.find((n) => n.id === edge.to_node_id);

  return (
    <div className="mb-4 p-3 bg-muted rounded-md space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Edge to: {targetNode?.data.label || 'Unknown'} 
          ({edge.sourcePosition === 'left' ? '←' : '→'} → {edge.targetPosition === 'right' ? '→' : '←'})
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteEdge}
          className="h-6 w-6 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs">Target Node</Label>
        <Select value={edge.to_node_id} onValueChange={(value) => handleUpdateEdge('to_node_id', value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select target node" />
          </SelectTrigger>
          <SelectContent>
            {nodes
              .filter((n) => n.id !== nodeId)
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
          onChange={(e) => handleUpdateEdge('condition', e.target.value)}
          placeholder="e.g., if user says 'hello'"
          className="w-full"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs">Source Position</Label>
        <Select
          value={edge.sourcePosition || 'right'}
          onValueChange={(value: 'left' | 'right') => handleUpdateEdge('sourcePosition', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select source position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="right">Right (→)</SelectItem>
            <SelectItem value="left">Left (←)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label className="text-xs">Target Position</Label>
        <Select
          value={edge.targetPosition || 'left'}
          onValueChange={(value: 'left' | 'right') => handleUpdateEdge('targetPosition', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select target position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">(←) Left</SelectItem>
            <SelectItem value="right">Right (→)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
