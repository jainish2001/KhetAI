'use client';

import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: React.ReactNode;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex items-start gap-4', isUser && 'justify-end')}>
      {!isUser && (
        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarFallback>
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-4 text-base',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
        {content}
      </div>
      {isUser && (
        <Avatar className="h-10 w-10 border-2 border-muted-foreground">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
