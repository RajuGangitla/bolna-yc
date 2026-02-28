'use client';

import { useFlowStore } from '@/lib/store';
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

const nodeVariants = {
  trigger: { description: 'Starts the workflow when a specific event occurs' },
  agent: { description: 'AI-powered node that processes and responds to user input' },
  action: { description: 'Executes a task like sending emails or API calls' },
};

const nodeTypes = [
  { value: 'trigger', label: 'Trigger' },
  { value: 'agent', label: 'Agent' },
  { value: 'action', label: 'Action' },
];

export function NodeInfo() {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const nodes = useFlowStore((state) => state.nodes);
  const updateNode = useFlowStore((state) => state.updateNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  if (!selectedNode) return null;

  const nodeType = selectedNode.data.type || 'agent';
  const defaultDescription = nodeVariants[nodeType as keyof typeof nodeVariants]?.description || '';

  const handleTypeChange = (type: string) => {
    const newDescription = nodeVariants[type as keyof typeof nodeVariants]?.description || '';
    updateNode(selectedNode.id, { 
      type,
      description: selectedNode.data.description || newDescription,
    });
  };

  return (
    <div className="space-y-4">
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
        <Label htmlFor="node-type">Node Type</Label>
        <Select value={nodeType} onValueChange={handleTypeChange}>
          <SelectTrigger id="node-type" className="w-full">
            <SelectValue placeholder="Select node type" />
          </SelectTrigger>
          <SelectContent>
            {nodeTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-description">Description</Label>
        <Textarea
          id="node-description"
          value={selectedNode.data.description || ''}
          onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
          placeholder={defaultDescription}
          rows={3}
        />
        <p className="text-xs text-muted-foreground">{defaultDescription}</p>
      </div>
    </div>
  );
}
