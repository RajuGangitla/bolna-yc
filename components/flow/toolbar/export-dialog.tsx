'use client';

import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useFlowStore } from '@/lib/store';
import { FlowState } from '@/lib/types';
import { useState, useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


export default function ExportDialog() {
    const getFlowJson = useFlowStore((state: FlowState) => state.getFlowJson);
    const nodes = useFlowStore((state) => state.nodes);
    const edges = useFlowStore((state) => state.edges);
    const startNodeId = useFlowStore((state) => state.startNodeId);
    const [open, setOpen] = useState(false);
    
    const flowJson = useMemo(() => getFlowJson(), [nodes, edges, startNodeId]);
  
    const handleCopy = () => {
        navigator.clipboard.writeText(flowJson);
        toast.success('Copied to clipboard');
    };

    const handleDownload = () => {
        const blob = new Blob([flowJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flow.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Flow downloaded');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="accent" size="icon" onClick={() => setOpen(true)}>
                            <Download className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Export Flow</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="max-w-2xl" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Export Flow</DialogTitle>
                </DialogHeader>
                <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-x-auto max-h-[400px]">
                    {flowJson}
                </pre>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCopy} className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy
                    </Button>
                    <Button onClick={handleDownload} className="gap-2">
                        <Download className="w-4 h-4" />
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
