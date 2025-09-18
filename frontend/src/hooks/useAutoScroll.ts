import { useCallback, RefObject } from 'react';

export const useAutoScroll = (messagesEndRef: RefObject<HTMLDivElement> | null) => {
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesEndRef]);

  const scrollToBottomInstant = useCallback(() => {
    if (messagesEndRef?.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
    }
  }, [messagesEndRef]);

  return {
    scrollToBottom,
    scrollToBottomInstant
  };
};