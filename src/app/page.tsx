
'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Image as ImageIcon, X, Mic } from 'lucide-react';
import Image from 'next/image';
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'initial-message',
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
  
  useEffect(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setPlayingMessageId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayAudio = (audioDataUri: string, messageId: string) => {
    if (currentAudio && playingMessageId === messageId) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingMessageId(null);
    } else {
       if (currentAudio) {
         currentAudio.pause();
       }
       const audio = new Audio(audioDataUri);
       setCurrentAudio(audio);
       setPlayingMessageId(messageId);
       audio.play();
       audio.onended = () => {
         setCurrentAudio(null);
         setPlayingMessageId(null);
       }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageDataUri) || loading) return;

    const userMessage: ChatMessageProps = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      image: imagePreview || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setImagePreview(null);
    setLoading(true);

    try {
      if (!location) {
        toast({ title: t('location_not_set'), description: t('set_location_for_agent'), variant: 'destructive' });
        setMessages(prev => [...prev, { id: 'error-loc-' + Date.now(), role: 'assistant', content: t('set_location_for_agent')}]);
        setLoading(false);
        return;
      }

      const response = await khetAIAgent({
        query: input,
        location: location.city,
        targetLanguage: language,
        photoDataUri: imageDataUri || undefined,
      });

      const assistantMessage: ChatMessageProps = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        audio: response.audio,
        onPlayAudio: handlePlayAudio,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      if (response.audio) {
          const audio = new Audio(response.audio);
          setCurrentAudio(audio);
          setPlayingMessageId(assistantMessage.id!);
          audio.play();
          audio.onended = () => {
            setCurrentAudio(null);
            setPlayingMessageId(null);
          };
      }

    } catch (error) {
      console.error('Agent error:', error);
      toast({ title: t('agent_error'), variant: 'destructive' });
      const errorMessage: ChatMessageProps = { id: 'error-agent-' + Date.now(), role: 'assistant', content: t('agent_error_message') };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setImageDataUri(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="space-y-6 p-4 md:p-6">
              {messages.map((msg) => (
                  <ChatMessage key={msg.id} {...msg} isPlaying={playingMessageId === msg.id} />
              ))}
              {loading && <ChatMessage id="loading" role="assistant" content={<Loader2 className="h-6 w-6 animate-spin" />} />}
          </div>
      </ScrollArea>
      <div className="shrink-0 p-4 md:p-6 bg-background border-t">
          {imagePreview && (
               <div className="relative w-24 h-24 mb-2 rounded-md overflow-hidden border">
                  <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" />
                  <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 z-10"
                      onClick={() => { setImagePreview(null); setImageDataUri(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                  >
                      <X className="h-4 w-4" />
                  </Button>
              </div>
          )}
        <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
           <div className="absolute left-3 flex items-center">
               <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                  <ImageIcon className="h-6 w-6" />
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('agent_placeholder')}
            className="flex-1 text-base p-4 pl-14 pr-24"
            disabled={loading}
          />
           <div className="absolute right-14 flex items-center">
              <VoiceInputButton
              disabled={loading}
              onTranscript={(text) => setInput(text)}
              />
          </div>
          <div className="absolute right-2">
              <Button type="submit" size="icon" disabled={loading || (!input.trim() && !imageDataUri)} className="h-10 w-10">
                  <Send className="h-5 w-5" />
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
