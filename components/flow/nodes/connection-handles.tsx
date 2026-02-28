import { Handle, Position } from '@xyflow/react';

export function ConnectionHandles() {
  return (
    <>
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-background !border-2 !border-primary transition-transform hover:scale-125" 
      />
      <Handle 
        id="target-right"
        type="target" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-background !border-2 !border-primary transition-transform hover:scale-125" 
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-background !border-2 !border-primary transition-transform hover:scale-125" 
      />
      <Handle 
        id="source-left"
        type="source" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-background !border-2 !border-primary transition-transform hover:scale-125" 
      />
    </>
  );
}
