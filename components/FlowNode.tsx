'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { FlowNodeData } from '@/lib/types';
import { useFlowStore } from '@/lib/store';
import { Play, Zap, Check, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export function FlowNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData;
  const setSelectedNode = useFlowStore((state) => state.setSelectedNode);
  const nodeErrors = useFlowStore((state) => state.validationErrors).filter(
    (e) => e.nodeId === id
  );

  const status: NodeStatus = (nodeData as any).status || 'idle';

  return (
    <div
      className={cn(
        'relative w-48 h-48 rounded-lg border bg-card transition-all duration-200 cursor-pointer',
        selected && 'border-primary ring-2 ring-primary/20',
        nodeData.isStart && 'border-green-500',
        nodeErrors.length > 0 && 'border-destructive',
        status === 'success' && 'border-green-500',
        status === 'error' && 'border-red-500',
        status === 'running' && 'border-blue-500'
      )}
      onClick={() => setSelectedNode(id)}
    >
      {status === 'running' && (
        <div className="absolute inset-0 rounded-lg animate-pulse bg-blue-500/10" />
      )}
      
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3" />
      
      <div className="flex flex-col items-center justify-center gap-3 p-4 h-full">
        {status && status !== 'idle' && (
          <div
            className={cn(
              'absolute top-2 right-2 rounded-full p-1',
              status === 'success' && 'bg-green-500/50',
              status === 'error' && 'bg-red-500/50'
            )}
          >
            {status === 'success' && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
            {status === 'error' && <XCircle className="w-3 h-3 text-white" strokeWidth={2.5} />}
            {status === 'running' && <Loader2 className="w-3 h-3 text-white animate-spin" />}
          </div>
        )}

        {nodeData.isStart ? (
          <Play className="w-10 h-10 text-green-500" strokeWidth={1.5} />
        ) : (
          <Zap className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
        )}
        
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="font-semibold text-sm">
            {nodeData.label || 'Unnamed Node'}
          </div>
          
          <div className="text-xs text-muted-foreground line-clamp-2">
            {nodeData.isStart ? 'Start' : nodeData.description || 'No description'}
          </div>
        </div>
        
        {nodeData.edges.length > 0 && (
          <div className="absolute bottom-2 text-xs text-muted-foreground">
            {nodeData.edges.length} edge{nodeData.edges.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-3 !h-3" />
    </div>
  );
}
