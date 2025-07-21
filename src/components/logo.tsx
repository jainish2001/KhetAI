import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 text-primary', className)}>
      <Leaf className="h-6 w-6" />
      <h1 className="text-xl font-bold text-foreground font-headline">KhetAI</h1>
    </div>
  );
}
