'use client';

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, Position } from '@xyflow/react';
import { useFlowStore } from '@/lib/store';

type EdgeProps = {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  style?: React.CSSProperties;
  markerEnd?: string;
};

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
  sourceHandle,
  targetHandle,
  style = {},
  markerEnd,
}: EdgeProps) {
  const nodes = useFlowStore((state) => state.nodes);
  
  const effectiveSourcePosition = sourceHandle === 'source-left' ? Position.Left : sourcePosition;
  const effectiveTargetPosition = targetHandle === 'target-right' ? Position.Right : Position.Left;
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: effectiveSourcePosition,
    targetX,
    targetY,
    targetPosition: effectiveTargetPosition,
  });

  const sourceNode = nodes.find((n) => n.id === source);
  const edgeInfo = sourceNode?.data.edges.find((e) => e.to_node_id === target);
  const conditionLabel = edgeInfo?.condition || '';

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {conditionLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="px-2 py-1 bg-background border border-border rounded-md text-xs shadow-sm max-w-[150px] truncate"
          >
            {conditionLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
