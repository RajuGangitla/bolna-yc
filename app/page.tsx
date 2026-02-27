'use client';

import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from '@/components/flow/toolbar/index';
import FlowBuilder from '@/components/flow/builder';
import NodeSidebar from '@/components/flow/nodes/sidebar';


function FlowBuilderInner() {
  return (
    <div className="relative h-screen bg-background">
      <Toolbar />
      <FlowBuilder />
      <NodeSidebar />
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
