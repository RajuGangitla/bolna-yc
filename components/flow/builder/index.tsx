'use client';

import { useCallback, useEffect, useState } from 'react';
import { useFlowStore } from '@/lib/store';
import { FlowNodeComponent } from '../nodes/index';
import { Canvas, Edge, Controls, Connection } from '@/components/flow';
import { Panel } from '@/components/flow/panel';
import { EdgeChange, NodeChange, Connection as XYFlowConnection } from '@xyflow/react';
import { ConditionEdge } from '../edges/condition-edge';

const nodeTypes = {
  flowNode: FlowNodeComponent,
};

const edgeTypes = {
  animated: ConditionEdge,
  temporary: Edge.Temporary,
};


export default function FlowBuilder(){

  const [mounted, setMounted] = useState(false);
  const storeNodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);
  const setSelectedNode = useFlowStore((state) => state.setSelectedNode);
  const validate = useFlowStore((state) => state.validate);

  const nodes = storeNodes ?? [];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNodesChange = (changes: NodeChange[]) => {
    onNodesChange(changes);
  }

  const handleEdgesChange = (changes: EdgeChange[]) => {
    onEdgesChange(changes);
  }

  const handleConnect = (connection: XYFlowConnection) => {
    onConnect(connection);
  }

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const handlePaneClick = useCallback(() => {
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
    <>
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
      </>
  )
}