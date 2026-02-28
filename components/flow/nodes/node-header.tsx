import { Loader2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeVariant } from './node-variants';

interface NodeHeaderProps {
  variant: NodeVariant;
  label: string;
  status: string;
  isStart?: boolean;
}

export function NodeHeader({ variant, label, status, isStart }: NodeHeaderProps) {
  const Icon = variant.icon;
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-background border shadow-sm transition-transform group-hover:scale-110", variant.color)}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
            {variant.label}
          </p>
          <h3 className="text-base font-bold text-foreground mt-1">
            {label || 'New Node'}
          </h3>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isStart && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider">
            <Play size={10} />
            START
          </span>
        )}
        {status === 'running' && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10">
            <Loader2 size={12} className="animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
}
