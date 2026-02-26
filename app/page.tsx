'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useFlowStore } from '@/lib/store';
import { FlowNodeComponent } from '@/components/FlowNode';
import { ConditionEdge } from '@/components/ConditionEdge';
import { Canvas, Edge, Controls, Connection } from '@/components/flow';
import { Panel } from '@/components/flow/panel';
import { NodeSidebarContent } from '@/components/NodeSidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, Download, Upload, Copy, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const nodeTypes = {
  flowNode: FlowNodeComponent,
};

const edgeTypes = {
  animated: ConditionEdge,
  temporary: Edge.Temporary,
};

function FlowBuilderInner() {
  const [mounted, setMounted] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const storeNodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);
  const addNode = useFlowStore((state) => state.addNode);
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const setSelectedNode = useFlowStore((state) => state.setSelectedNode);
  const validate = useFlowStore((state) => state.validate);
  const getFlowJson = useFlowStore((state) => state.getFlowJson);
  const importFlow = useFlowStore((state) => state.importFlow);

  const nodes = storeNodes ?? [];
  const flowJson = getFlowJson();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const handleConnect = useCallback(
    (connection: any) => {
      onConnect(connection);
    },
    [onConnect]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const handleCloseSidebar = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  const handleDownload = () => {
    const blob = new Blob([flowJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flow.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Flow downloaded');
    setShowExport(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(flowJson);
    toast.success('Copied to clipboard');
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

  useEffect(() => {
    if (mounted) {
      validate();
    }
  }, [nodes, validate, mounted]);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-background">
      {/* Toolbar */}
      <div className="pointer-events-auto absolute top-4 right-4 z-10">
        <div className="flex flex-col-reverse items-end gap-2 lg:flex-row lg:items-center">
          <Button onClick={addNode} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Add Node
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} title="Import">
              <Upload className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="ghost" size="icon" onClick={() => setShowExport(true)} title="Export">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => document.documentElement.classList.toggle('dark')} title="Toggle Theme">
              <Sun className="w-4 h-4 dark:hidden" />
              <Moon className="w-4 h-4 hidden dark:block" />
            </Button>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <Canvas
        className="bg-background"
        connectionLineComponent={Connection}
        edges={edges}
        edgeTypes={edgeTypes}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onConnect={handleConnect}
        onEdgesChange={handleEdgesChange}
        onNodeClick={handleNodeClick}
        onNodesChange={handleNodesChange}
        onPaneClick={handlePaneClick}
        defaultEdgeOptions={{ type: 'animated', animated: true }}
        defaultViewport={{ x: 0, y: 0, zoom: 1.2 }}
        fitView={false}
      >
        <Panel
          className="workflow-controls-panel border-none bg-transparent p-0"
          position="bottom-right"
        >
          <Controls />
        </Panel>
      </Canvas>

      {/* Node Sidebar Drawer */}
      <Drawer
        open={!!selectedNodeId}
        onClose={handleCloseSidebar}
        direction="right"
      >
        <DrawerContent className="w-[320px] sm:w-[360px] top-0 mt-0 h-full rounded-none border-l">
          <DrawerHeader className="border-b flex flex-row items-center justify-between">
            <DrawerTitle>Edit Node</DrawerTitle>
            <Button variant="ghost" size="icon" onClick={handleCloseSidebar}>
              <span className="sr-only">Close</span>
            </Button>
          </DrawerHeader>
          <NodeSidebarContent onClose={handleCloseSidebar} />
        </DrawerContent>
      </Drawer>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Flow</DialogTitle>
          </DialogHeader>
          <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-x-auto max-h-[400px]">
            {flowJson}
          </pre>
          <DialogFooter>
            <Button variant="outline" onClick={handleCopy} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
