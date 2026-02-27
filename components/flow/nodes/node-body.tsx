interface NodeBodyProps {
  description: string;
}

export function NodeBody({ description }: NodeBodyProps) {
  return (
    <p className="text-sm text-muted-foreground/80 leading-snug">
      {description}
    </p>
  );
}
