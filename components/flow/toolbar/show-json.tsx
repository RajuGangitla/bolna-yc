'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';
import { JsonPanel } from '../json-panel';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function ShowJson() {
    const [showJson, setShowJson] = useState(false);

    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="accent"
                        size="icon"
                        onClick={() => setShowJson(!showJson)}
                    >
                        <Code size={18} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Toggle JSON View</p>
                </TooltipContent>
            </Tooltip>
            {showJson && <JsonPanel />}
        </>
    );
}
