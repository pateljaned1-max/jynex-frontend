'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  onFinalResult?: (transcript: string) => void;
  silenceTimeoutMs?: number; // Shanti hone ke baad wait time
  language?: string;
}

export function useSpeechRecognition({
  onFinalResult,
  silenceTimeoutMs = 2000, // 2 seconds silence ke baad submit
  language = 'en-IN',
}: SpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let accumulatedFinal = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            accumulatedFinal += (accumulatedFinal ? ' ' : '') + item[0].transcript.trim();
          } else {
            currentInterim += item[0].transcript;
          }
        }

        finalTranscriptRef.current = accumulatedFinal;
        setTranscript(accumulatedFinal);
        setInterimTranscript(currentInterim);

        // Reset silence detection
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }

        const totalSpoken = (accumulatedFinal + ' ' + currentInterim).trim();

        if (totalSpoken.length > 0) {
          silenceTimerRef.current = setTimeout(() => {
            if (onFinalResult && totalSpoken.length > 0) {
              onFinalResult(totalSpoken);
              stopListening();
            }
          }, silenceTimeoutMs);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Keep alive on silent intervals
          return;
        }
      };

      recognition.onend = () => {
        // Automatically restart if state is still listening
        if (recognitionRef.current && isListening) {
          try {
            recognition.start();
          } catch (e) {
            // Already active
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [language, onFinalResult, silenceTimeoutMs, isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setInterimTranscript('');
    finalTranscriptRef.current = '';

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Recognition start caught:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.warn('Recognition stop caught:', err);
    }
  }, []);

  return {
    isListening,
    transcript: (transcript + ' ' + interimTranscript).trim(),
    startListening,
    stopListening,
    isSupported,
  };
}