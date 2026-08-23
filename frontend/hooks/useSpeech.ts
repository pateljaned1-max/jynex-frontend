'use client';
import { useState, useRef, useEffect } from 'react';

export function useSpeech(onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript && transcript.trim().length > 0) {
        onResult(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'network' || event.error === 'aborted') {
        setIsListening(false);
        return;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onResult]);

  const toggleListening = async () => {
    if (typeof window === 'undefined') return;

    // 1. Force mic prompt using standard MediaDevices API
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stream verify hote hi close karo taaki speech recognition use kar sake
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      alert('Microphone permission block hai ya mic connect nahi hai. Chrome URL bar me lock/tune icon par click karke mic allow karein.');
      return;
    }

    // 2. Start Speech Recognition
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch {}
      }
    }
  };

  return { isListening, toggleListening };
}