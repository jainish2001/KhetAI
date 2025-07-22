'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language-context';

interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export default function VoiceInputButton({ onTranscript, disabled }: VoiceInputButtonProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language; 

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
       toast({
        title: 'Voice Error',
        description: `Could not start voice recognition: ${event.error}`,
        variant: 'destructive',
      });
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onTranscript, toast, language]);

  const handleToggleListening = () => {
    if (disabled) return;
    
    if (!recognitionRef.current) {
      toast({
        title: 'Unsupported Browser',
        description: 'Voice input is not supported by your browser.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch(e) {
         toast({
          title: 'Could not start listening',
          description: 'Please ensure microphone permissions are granted.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Button
      type="button"
      variant={isListening ? 'destructive' : 'outline'}
      size="icon"
      onClick={handleToggleListening}
      disabled={disabled}
      aria-label={t('speak_query_button')}
      className="p-2 h-auto"
    >
      {isListening ? <MicOff className="h-6 w-6"/> : <Mic className="h-6 w-6"/>}
    </Button>
  );
}
