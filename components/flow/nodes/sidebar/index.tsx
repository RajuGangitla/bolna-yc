import { Button } from '@/components/ui/button';
import {  
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { useFlowStore } from '@/lib/store';
import { NodeSidebarContent } from './sidebar-content';

export default function NodeSidebar() {
    const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
    const setSelectedNode = useFlowStore((state) => state.setSelectedNode);

    const handleCloseSidebar = () => {
        setSelectedNode(null);
      }

    return (
        <>
            <Drawer
                open={!!selectedNodeId}
                onClose={handleCloseSidebar}
                direction="right"
            >
                <DrawerContent className="w-[320px] sm:w-[360px] top-0 mt-0 h-full rounded-none border-l">
                    <DrawerHeader className="border-b flex flex-row items-center justify-between">
                        <DrawerTitle>Edit Node</DrawerTitle>
                        <Button variant="ghost" size="icon" onClick={handleCloseSidebar}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DrawerHeader>
                    <NodeSidebarContent />
                </DrawerContent>
            </Drawer>

        </>
    );
}