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
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  
  // Check if node is disconnected (no edges)
  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  const isDisconnected = !nodeData.isStart && !connectedNodeIds.has(id);

  const status: NodeStatus = (nodeData as any).status || 'idle';

  // Determine node type and styling
  const isStart = nodeData.isStart;
  const nodeType = isStart ? 'input' : 'action';
  
  // Color scheme based on node type
  const colorConfig = {
    input: {
      iconBg: 'bg-blue-500',
      icon: Play,
      label: 'Input',
    },
    action: {
      iconBg: 'bg-orange-500',
      icon: Zap,
      label: 'Action',
    },
  };

  const config = colorConfig[nodeType];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative w-80 rounded-lg border bg-card shadow-md transition-all duration-150 ease-out cursor-pointer overflow-hidden',
        selected && 'border-primary ring-2 ring-primary/20',
        isDisconnected && 'border-destructive border-2',
        status === 'success' && 'border-green-500',
        status === 'error' && 'border-red-500',
        status === 'running' && 'border-blue-500'
      )}
      onClick={() => setSelectedNode(id)}
    >
      {status === 'running' && (
        <div className="absolute inset-0 animate-pulse bg-blue-500/5" />
      )}
      
      <Handle type="target" position={Position.Left} className="!bg-muted-foreground !w-3 !h-3" />
      
      {/* Header with icon badge */}
      <div className="flex items-start gap-3 p-4">
        {/* Circular icon badge */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          config.iconBg,
          'text-white'
        )}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {config.label}
            </span>
            {status && status !== 'idle' && status !== 'running' && (
              <div
                className={cn(
                  'rounded-full p-0.5',
                  status === 'success' && 'bg-green-500/20',
                  status === 'error' && 'bg-red-500/20'
                )}
              >
                {status === 'success' && <Check className="w-3 h-3 text-green-600" strokeWidth={2.5} />}
                {status === 'error' && <XCircle className="w-3 h-3 text-red-600" strokeWidth={2.5} />}
              </div>
            )}
            {status === 'running' && (
              <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
            )}
          </div>
          
          <h3 className="font-semibold text-sm mb-1 truncate">
            {nodeData.label || 'Unnamed Node'}
          </h3>
          
          {nodeData.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {nodeData.description}
            </p>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="!bg-muted-foreground !w-3 !h-3" />
    </div>
  );
}
