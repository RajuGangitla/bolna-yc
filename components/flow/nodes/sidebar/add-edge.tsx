'use client';

import { useFlowStore } from '@/lib/store';
import { Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
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

export function AddEdge() {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);
  const addEdgeToNode = useFlowStore((state) => state.addEdgeToNode);

  const [target, setTarget] = useState('');
  const [condition, setCondition] = useState('');
  const [sourcePosition, setSourcePosition] = useState<'left' | 'right'>('right');
  const [targetPosition, setTargetPosition] = useState<'left' | 'right'>('left');

  useEffect(() => {
    setTarget('');
    setCondition('');
    setSourcePosition('right');
    setTargetPosition('left');
  }, [selectedNodeId]);

  const handleAddEdge = () => {
    if (target && selectedNodeId) {
      addEdgeToNode(selectedNodeId, {
        to_node_id: target,
        condition,
        sourcePosition,
        targetPosition,
      });
      setTarget('');
      setCondition('');
      setSourcePosition('right');
      setTargetPosition('left');
    }
  };

  if (!selectedNodeId || nodes.length <= 1) {
    return (
      <p className="text-xs text-muted-foreground p-3 bg-muted rounded-md">
        Add more nodes to create connections
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Add New Edge</Label>
      <Select value={target} onValueChange={setTarget}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select target node" />
        </SelectTrigger>
        <SelectContent>
          {nodes
            .filter((n) => n.id !== selectedNodeId)
            .map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {n.data.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Input
        type="text"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        placeholder="e.g., if user says 'hello'"
        className="w-full"
      />
      <div className="space-y-2">
        <Label className="text-xs">Source Position</Label>
        <Select 
          value={sourcePosition} 
          onValueChange={(value: 'left' | 'right') => setSourcePosition(value)}
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
          value={targetPosition} 
          onValueChange={(value: 'left' | 'right') => setTargetPosition(value)}
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
      <Button
        onClick={handleAddEdge}
        disabled={!target}
        className="w-full gap-1"
      >
        <Plus className="w-4 h-4" />
        Add Edge
      </Button>
    </div>
  );
}
