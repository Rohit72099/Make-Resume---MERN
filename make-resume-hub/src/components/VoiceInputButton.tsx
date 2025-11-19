import { Button } from '@/components/ui/button';
import { useSpeechInput } from '@/hooks/useSpeechInput';
import { Mic, Square } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoiceInputButtonProps {
  onResult: (text: string) => void;
  label?: string;
  size?: 'icon' | 'sm' | 'default';
}

export const VoiceInputButton = ({ onResult, label = 'Voice input', size = 'icon' }: VoiceInputButtonProps) => {
  const { supported, listening, start, stop, error } = useSpeechInput({ onResult });

  if (!supported) return null;

  const toggle = () => {
    if (listening) stop();
    else start();
  };

  const button = (
    <Button
      type="button"
      variant={listening ? 'destructive' : 'outline'}
      size={size}
      onClick={toggle}
      className="shrink-0"
    >
      {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      {size !== 'icon' && <span className="ml-2">{listening ? 'Stop' : 'Speak'}</span>}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent className="text-xs max-w-xs">
          <p>{label}</p>
          {error && <p className="text-destructive mt-1">{error}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


