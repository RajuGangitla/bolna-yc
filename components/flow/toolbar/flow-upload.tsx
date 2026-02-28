import { Button } from "@/components/ui/button";
import { Upload as UploadIcon } from "lucide-react";
import { useRef } from "react";
import { useFlowStore } from "@/lib/store";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function FlowUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importFlow = useFlowStore((state) => state.importFlow);

    const handleImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (imported.nodes && Array.isArray(imported.nodes)) {
                    const normalizedNodes = imported.nodes.map((node: Record<string, unknown>, index: number) => {
                        const position = node.position as { x: number; y: number } | undefined;
                        return {
                            id: node.id as string,
                            type: 'flowNode',
                            position: position ? { x: position.x, y: position.y } : { x: 100 + index * 350, y: 200 + (index % 3) * 150 },
                            data: {
                                id: node.id as string,
                                type: (node.type as string) || 'agent',
                                description: (node.description as string) || '',
                                edges: (node.edges as Array<Record<string, unknown>>) || [],
                                isStart: (node.isStart as boolean) || false,
                                label: (node.label as string) || 'Unnamed',
                            },
                        };
                    });
                    
                    const normalizedEdges = (imported.edges || []).map((edge: Record<string, unknown>) => ({
                        id: edge.id as string,
                        source: edge.source as string,
                        target: edge.target as string,
                        type: 'animated',
                        animated: true,
                        sourceHandle: edge.sourceHandle as string | null,
                        targetHandle: edge.targetHandle as string | null,
                    }));
                    
                    importFlow({ 
                        nodes: normalizedNodes, 
                        edges: normalizedEdges 
                    });
                    toast.success('Flow imported successfully');
                } else {
                    toast.error('Invalid JSON file: missing nodes array');
                }
            } catch (e) {
                console.error('Import error:', e);
                toast.error('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="accent"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadIcon className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Import Flow</p>
                </TooltipContent>
            </Tooltip>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                }}
                className="hidden"
            />
        </>
    );
}
