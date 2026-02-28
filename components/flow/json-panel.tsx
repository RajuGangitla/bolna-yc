'use client';

import { useFlowStore } from '@/lib/store';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

function highlightJson(json: string): string {
  return json
    .replace(/(".*?")\s*:/g, '<span class="text-blue-500">$1</span>:')
    .replace(/:\s*(".*?")/g, ': <span class="text-green-500">$1</span>')
    .replace(/:\s*(\d+)/g, ': <span class="text-orange-500">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="text-purple-500">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="text-gray-500">$1</span>');
}


export function JsonPanel() {
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const startNodeId = useFlowStore((state) => state.startNodeId);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  const flowJson = useMemo(() => {
    const flowData = {
      nodes: nodes.map((node) => ({
        id: node.data.id,
        type: node.data.type,
        label: node.data.label,
        description: node.data.description,
        edges: node.data.edges.map((edge) => ({
          to_node_id: edge.to_node_id,
          condition: edge.condition,
        })),
        isStart: node.data.isStart,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      start_node_id: startNodeId,
    };
    return JSON.stringify(flowData, null, 2);
  }, [nodes, edges, startNodeId]);
  const highlightedJson = useMemo(() => highlightJson(flowJson), [flowJson]);


  const handleCopy = () => {
    navigator.clipboard.writeText(flowJson);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="absolute top-16 right-0 w-80 max-h-[50vh] bg-background border rounded-lg shadow-lg flex flex-col z-10">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium">Flow JSON</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
      </div>
      <pre className="flex-1 overflow-auto p-3 text-xs font-mono bg-muted/50 whitespace-pre-wrap">
      <code dangerouslySetInnerHTML={{ __html: highlightedJson }} />
      </pre>
    </div>
  );
}
