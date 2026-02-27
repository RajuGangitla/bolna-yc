'use client';

import { NodeProps } from '@xyflow/react';
import { FlowNodeData } from '@/lib/types';
import { getNodeVariant } from './node-variants';
import { NodeContainer } from './node-container';
import { NodeHeader } from './node-header';
import { NodeBody } from './node-body';
import { NodeFooter } from './node-footer';
import { DeleteButton } from './delete-button';
import { ConnectionHandles } from './connection-handles';

export function FlowNodeComponent({ id, data, selected }: NodeProps) {
    const nodeData = data as FlowNodeData;
    const status = typeof nodeData.status === 'string' ? nodeData.status : 'idle';

    const variant = getNodeVariant(nodeData.type || 'agent');

    return (
        <NodeContainer variant={variant} selected={!!selected} status={status}>
            <DeleteButton id={id} />
            <ConnectionHandles />

            <div className="relative p-6 space-y-4">
                <NodeHeader
                    variant={variant}
                    label={nodeData.label || 'New Node'}
                    status={status}
                />
                <NodeBody description={nodeData.description} />
                <NodeFooter status={status} />
            </div>
        </NodeContainer>
    );
}
