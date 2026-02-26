'use client';

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { useFlowStore } from '@/lib/store';

export function ConditionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  source,
  target,
  style = {},
  markerEnd,
}: EdgeProps) {
  const nodes = useFlowStore((state) => state.nodes);
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const sourceNode = nodes.find((n) => n.id === source);
  const edgeInfo = sourceNode?.data.edges.find((e) => e.to_node_id === target);
  const conditionLabel = edgeInfo?.condition || '';

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="px-2 py-1 bg-background border border-border rounded-md text-xs shadow-sm max-w-[150px] truncate"
        >
          {conditionLabel || 'unlabeled'}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
