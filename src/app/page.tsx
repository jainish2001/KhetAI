'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { useLanguage } from '@/contexts/language-context';
import { useLocation } from '@/contexts/location-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import VoiceInputButton from '@/components/voice-input-button';
import ChatMessage, { ChatMessageProps } from '@/components/chat-message';
import { useToast } from '@/hooks/use-toast';
import { khetAIAgent } from '@/ai/flows/khet-ai-agent';

export default function Home() {
  const { t, language } = useLanguage();
  const { location } = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessageProps[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: t('welcome_message_agent'),
      },
    ]);
  }, [t]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessageProps = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
        if (!location) {
            toast({ title: t('location_not_set'), description: t('set_location_for_agent'), variant: 'destructive' });
            setMessages(prev => [...prev, { role: 'assistant', content: t('set_location_for_agent')}]);
            setLoading(false);
            return;
        }

      const response = await khetAIAgent({
        query: input,
        location: location.city,
        targetLanguage: language,
      });

      const assistantMessage: ChatMessageProps = { role: 'assistant', content: response.response };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Agent error:', error);
      toast({ title: t('agent_error'), variant: 'destructive' });
      const errorMessage: ChatMessageProps = { role: 'assistant', content: t('agent_error_message') };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={t('welcome_title')}
        subtitle={t('welcome_subtitle_agent')}
      />
      <main className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
        <ScrollArea className="flex-1 mb-4" ref={scrollAreaRef}>
            <div className="space-y-6 pr-4">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} role={msg.role} content={msg.content} />
                ))}
                {loading && <ChatMessage role="assistant" content={<Loader2 className="h-6 w-6 animate-spin" />} />}
            </div>
        </ScrollArea>
        <div className="mt-auto bg-background">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('agent_placeholder')}
              className="flex-1 text-base p-6"
              disabled={loading}
            />
            <VoiceInputButton
              disabled={loading}
              onTranscript={(text) => setInput(text)}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-12 w-12">
              <Send className="h-6 w-6" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
