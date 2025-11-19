import { useCallback, useEffect, useRef, useState } from 'react';

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
};

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionResultList = {
  length: number;
  item: (index: number) => SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionResult = {
  length: number;
  isFinal: boolean;
  item: (index: number) => SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionAlternative = {
  transcript: string;
  confidence: number;
};

type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

const getSpeechRecognitionConstructor = (): { new (): SpeechRecognitionInstance } | null => {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

interface UseSpeechInputOptions {
  lang?: string;
  onResult?: (text: string) => void;
}

export const useSpeechInput = (options: UseSpeechInputOptions = {}) => {
  const { lang = 'en-IN', onResult } = options;
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const onResultRef = useRef(onResult);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) {
      setSupported(false);
      return;
    }

    const recognition = new Constructor();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };
    recognition.onresult = (event) => {
      const result = Array.from(event.results)
        .map((res) => Array.from(res).map((alt) => alt.transcript).join(' '))
        .join(' ')
        .trim();
      setTranscript(result);
      if (result && onResultRef.current) {
        onResultRef.current(result);
      }
    };

    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setTranscript('');
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (err) {
      setError((err as Error).message);
    }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current || !listening) return;
    recognitionRef.current.stop();
  }, [listening]);

  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop,
    reset,
  };
};


