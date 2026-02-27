import { useFlowStore } from '@/lib/store';
import { Trash2 } from 'lucide-react';

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
    <button 
      onClick={handleDelete}
      className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 shadow-sm transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 z-20"
    >
      <Trash2 size={14} />
    </button>
  );
}
