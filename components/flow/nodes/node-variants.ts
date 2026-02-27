import { Play, Sparkles, Zap, LucideIcon } from 'lucide-react';

export interface NodeVariant {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
  gradient: string;
  glow: string;
}

export const nodeVariants: Record<string, NodeVariant> = {
  trigger: { 
    label: 'Trigger', 
    description: 'Entry point that starts the conversation flow',
    icon: Play, 
    color: 'text-emerald-500', 
    borderColor: 'group-hover:border-emerald-500/50',
    gradient: 'from-emerald-500/10 via-transparent to-transparent',
    glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]'
  },
  agent: { 
    label: 'Agent', 
    description: 'AI agent that processes and generates responses',
    icon: Sparkles, 
    color: 'text-purple-500', 
    borderColor: 'group-hover:border-purple-500/50',
    gradient: 'from-purple-500/10 via-transparent to-transparent',
    glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.1)]'
  },
  action: { 
    label: 'Action', 
    description: 'Performs a specific task or function',
    icon: Zap, 
    color: 'text-blue-500', 
    borderColor: 'group-hover:border-blue-500/50',
    gradient: 'from-blue-500/10 via-transparent to-transparent',
    glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.1)]'
  }
};

export const defaultVariant: NodeVariant = {
  label: 'Agent',
  description: 'AI agent that processes and generates responses',
  icon: Sparkles,
  color: 'text-purple-500',
  borderColor: 'group-hover:border-purple-500/50',
  gradient: 'from-purple-500/10 via-transparent to-transparent',
  glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.1)]'
};

export function getNodeVariant(type: string): NodeVariant {
  return nodeVariants[type] || defaultVariant;
}
