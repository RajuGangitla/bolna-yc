'use client';

import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  return (
    <Button 
      variant="accent" 
      size="icon" 
      onClick={() => document.documentElement.classList.toggle('dark')} 
      title="Toggle Theme"
    >
      <Sun className="w-4 h-4 dark:hidden" />
      <Moon className="w-4 h-4 hidden dark:block" />
    </Button>
  );
}
