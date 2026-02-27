import { Button } from "@/components/ui/button";
import { Upload as UploadIcon } from "lucide-react";
import { useRef } from "react";
import { useFlowStore } from "@/lib/store";
import { toast } from "sonner";

export default function FlowUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importFlow = useFlowStore((state) => state.importFlow);

    const handleImport = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target?.result as string);
                if (imported.nodes && imported.edges) {
                    importFlow(imported);
                } else if (imported.nodes) {
                    importFlow({ nodes: imported.nodes, edges: [] });
                }
                toast.success('Flow imported successfully');
            } catch {
                toast.error('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <Button
                variant="accent"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                title="Import"
            >
                <UploadIcon className="w-4 h-4" />
            </Button>
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
