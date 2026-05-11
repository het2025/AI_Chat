import { useState, useCallback, useRef } from 'react';

export function useTypingEffect(updateLastAssistantMessage) {
  const [isStreaming, setIsStreaming] = useState(false);
  
  const typingQueueRef = useRef("");
  const displayContentRef = useRef("");
  const typingIntervalRef = useRef(null);

  const startTypingEffect = useCallback((convId, initialModel) => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    displayContentRef.current = "";
    typingIntervalRef.current = setInterval(() => {
      if (typingQueueRef.current.length > 0) {
        const speed = Math.floor(Math.random() * 3) + 1; 
        const chunk = typingQueueRef.current.substring(0, speed);
        typingQueueRef.current = typingQueueRef.current.substring(speed);
        displayContentRef.current += chunk;
        updateLastAssistantMessage(convId, displayContentRef.current, initialModel);
      }
    }, 20);
  }, [updateLastAssistantMessage]);

  const stopTypingEffect = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    typingQueueRef.current = "";
  }, []);

  const appendToQueue = useCallback((token) => {
    typingQueueRef.current += token;
  }, []);

  const getQueueLength = useCallback(() => {
    return typingQueueRef.current.length;
  }, []);

  const getDisplayContent = useCallback(() => {
    return displayContentRef.current;
  }, []);

  return {
    isStreaming,
    setIsStreaming,
    startTypingEffect,
    stopTypingEffect,
    appendToQueue,
    getQueueLength,
    getDisplayContent
  };
}
