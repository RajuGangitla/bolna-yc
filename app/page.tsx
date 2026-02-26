'use client';

import { useCallback, useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useTheme } from 'next-themes';
import { useFlowStore } from '@/lib/store';
import { FlowNodeComponent } from '@/components/FlowNode';
import { ConditionEdge } from '@/components/ConditionEdge';
import { Canvas, Edge, Controls, Connection } from '@/components/flow';
import { NodeSidebarContent } from '@/components/NodeSidebar';
import { JsonPreview } from '@/components/JsonPreview';
import { ThemeToggle } from '@/components/theme-toggle';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

const nodeTypes = {
  flowNode: FlowNodeComponent,
};

const edgeTypes = {
  animated: Edge.Animated,
  temporary: Edge.Temporary,
};

function FlowBuilderInner() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const storeNodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);
  const addNode = useFlowStore((state) => state.addNode);
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const setSelectedNode = useFlowStore((state) => state.setSelectedNode);
  const validate = useFlowStore((state) => state.validate);
  const validationErrors = useFlowStore((state) => state.validationErrors);

  const nodes = storeNodes ?? [];
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';

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
    <div className="h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Flow Builder</h1>
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-1 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {validationErrors.length} validation error(s)
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={addNode} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Node
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineComponent={Connection}
            defaultEdgeOptions={{ type: 'animated', animated: true }}
            className="bg-background"
          >
            <Controls />
          </Canvas>
        </div>

        <Drawer
          open={!!selectedNodeId}
          onClose={handleCloseSidebar}
          direction="right"
        >
          <DrawerContent className="w-[320px] sm:w-[360px] top-0 mt-0 h-full rounded-none border-l">
            <DrawerHeader className="border-b">
              <DrawerTitle>Edit Node</DrawerTitle>
            </DrawerHeader>
            <NodeSidebarContent onClose={handleCloseSidebar} />
          </DrawerContent>
        </Drawer>

        <JsonPreview />
      </div>
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
