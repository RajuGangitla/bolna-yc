import {
  BaseEdge,
  getSimpleBezierPath,
  type InternalNode,
  type Node,
  Position,
} from "@xyflow/react";

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
  selected?: boolean;
};

export const Temporary = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) => {
  const [edgePath] = getSimpleBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      className="stroke-1"
      id={id}
      path={edgePath}
      style={{
        stroke: selected ? "var(--muted-foreground)" : "var(--border)",
        strokeDasharray: "5, 5",
      }}
    />
  );
};

export const Edge = {
  Temporary,
};
