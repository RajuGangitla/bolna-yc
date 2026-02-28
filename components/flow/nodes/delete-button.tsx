import { useFlowStore } from '@/lib/store';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const deleteNode = useFlowStore((state) => state.deleteNode);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <Button
      onClick={handleDelete}
      variant="ghost"
      size="icon"
      className={cn(
        "absolute -right-2 -top-2 h-8 w-8 rounded-full border bg-background opacity-0 shadow-sm transition-all group-hover:opacity-100 z-20"
      )}
    >
      <Trash2 size={14} />
    </Button>
  );
}
