import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeVariant } from './node-variants';

interface NodeHeaderProps {
  variant: NodeVariant;
  label: string;
  status: string;
}

export function NodeHeader({ variant, label, status }: NodeHeaderProps) {
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
      
      {status === 'running' && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10">
          <Loader2 size={12} className="animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}
