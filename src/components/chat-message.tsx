'use client';

import { Bot, User, Volume2, Loader2, VolumeX } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  id?: string;
  role: 'user' | 'assistant';
  content: React.ReactNode;
  image?: string;
  audio?: string;
  isPlaying?: boolean;
  onPlayAudio?: (audioDataUri: string, messageId: string) => void;
}

export default function ChatMessage({ role, content, image, audio, id, isPlaying, onPlayAudio }: ChatMessageProps) {
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
          'max-w-[80%] rounded-lg p-4 text-base shadow-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground rounded-bl-none'
        )}
      >
        {image && (
          <div className="mb-2">
            <Image src={image} alt="User upload" width={200} height={200} className="rounded-md" />
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1 whitespace-pre-wrap">{content}</div>
          {audio && onPlayAudio && id && (
            <Button variant="ghost" size="icon" onClick={() => onPlayAudio(audio, id)} className="shrink-0">
               {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
        </div>
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
