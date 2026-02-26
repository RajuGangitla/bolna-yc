'use client';

import { useFlowStore } from '@/lib/store';
import { Copy, Download, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function JsonPreview() {
  const getFlowJson = useFlowStore((state) => state.getFlowJson);
  const importFlow = useFlowStore((state) => state.importFlow);
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [json, setJson] = useState(getFlowJson());

  useEffect(() => {
    setJson(getFlowJson());
  }, [nodes, edges, getFlowJson]);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    toast.success('Copied to clipboard');
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Flow downloaded');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.nodes && imported.edges) {
            importFlow(imported);
          } else if (imported.nodes) {
            importFlow({ nodes: imported.nodes, edges: [] });
          }
          toast.success('Flow imported successfully');
        } catch {
          toast.error('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const syntaxHighlight = (jsonStr: string) => {
    return jsonStr
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
        let cls = 'text-blue-600 dark:text-blue-400';
        if (/:$/.test(match)) {
          cls = 'text-purple-600 dark:text-purple-400 font-medium';
        }
        return `<span class="${cls}">${match}</span>`;
      })
      .replace(/\b(true|false|null)\b/g, '<span class="text-orange-500 dark:text-orange-400">$1</span>')
      .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="text-green-600 dark:text-green-400">$1</span>');
  };

  return (
    <div className="w-80 border-l bg-card flex flex-col h-screen">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">JSON Preview</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title="Copy JSON"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            title="Download JSON"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Import JSON"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>


      <div className="flex-1 overflow-auto p-4">
        <pre
          className="text-xs font-mono bg-muted p-3 rounded-md overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }}
        />
      </div>

      <div className="p-4 border-t bg-muted/50">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Nodes:</span>
            <span className="font-medium">{nodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Edges:</span>
            <span className="font-medium">{edges.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
