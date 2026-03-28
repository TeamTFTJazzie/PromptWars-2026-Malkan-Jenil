import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook to interact with the Web Speech API securely
 * @returns {Object} { text, isListening, startListening, stopListening, error }
 */
export const useSpeechRecognition = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(() => {
    return (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition))
      ? null
      : 'Speech Recognition API is not supported in this browser.';
  });
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize standard or vendor-prefixed SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript;
        } else {
          currentTranscript += event.results[i][0].transcript;
        }
      }
      setText(prevText => prevText + ' ' + currentTranscript);
    };

    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      setText('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setError(err.message);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);
  
  const resetText = useCallback(() => {
    setText('');
  }, []);

  return { text, isListening, startListening, stopListening, resetText, error };
};
