import { Handle, Position } from '@xyflow/react';

export function ConnectionHandles() {
  return (
    <>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-background !border-2 !border-primary transition-transform hover:scale-125" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-background !border-2 !border-primary transition-transform hover:scale-125" 
      />
    </>
  );
}
