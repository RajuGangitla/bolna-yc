import { cn } from '@/lib/utils';
import { NodeVariant } from './node-variants';

interface NodeContainerProps {
  children: React.ReactNode;
  variant: NodeVariant;
  selected?: boolean;
  status: string;
  isStart?: boolean;
}

export function NodeContainer({ children, variant, selected, status, isStart }: NodeContainerProps) {
  return (
    <div className={cn(
      'group relative w-[320px] rounded-3xl border bg-card transition-all duration-300 ease-in-out',
      'backdrop-blur-xl hover:shadow-xl',
      variant.glow,
      selected ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' : 'border-border/50',
      status === 'running' && 'animate-pulse border-blue-400'
    )}>
      <div className={cn(
        "absolute inset-0 rounded-3xl bg-gradient-to-br opacity-40 transition-opacity group-hover:opacity-70",
        variant.gradient
      )} />
      {children}
    </div>
  );
}
