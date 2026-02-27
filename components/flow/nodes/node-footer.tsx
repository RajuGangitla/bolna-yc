import { AlertCircle } from 'lucide-react';

interface NodeFooterProps {
  status: string;
}

export function NodeFooter({ status }: NodeFooterProps) {
  if (status !== 'error') return null;
  
  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-red-500/10 text-red-500">
      <AlertCircle size={14} />
      <span className="text-xs font-medium">System Error: Check logs</span>
    </div>
  );
}
