import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";
import { FlowState } from "@/lib/types";
import { Plus } from "lucide-react";

export default function AddNode() {
    const addNode = useFlowStore((state: FlowState) => state.addNode);
    
    const onAddNode = () => {
        addNode();
    };

    return (
        <Button variant="accent" onClick={onAddNode} size="sm" className="gap-1">
            <Plus className="w-4 h-4" />
            Add Node
        </Button>
    );
}