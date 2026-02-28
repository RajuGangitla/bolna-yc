'use client';

import { useFlowStore } from '@/lib/store';
import { NodeInfo } from './node-info';
import { EdgesList } from './edges-list';

export function NodeSidebarContent() {
  const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
  const validationErrors = useFlowStore((state) => state.validationErrors);

  const disconnectedError = validationErrors.find((e) => e.field === 'disconnected');

  if (!selectedNodeId) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground text-center py-8">
          Select a node to edit
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {disconnectedError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md m-4 mb-0">
          <p className="text-xs text-amber-700">{disconnectedError.message}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        <NodeInfo />
        <EdgesList />
      </div>
    </div>
  );
}
