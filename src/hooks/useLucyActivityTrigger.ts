import { useEffect } from 'react';

/**
 * Hook to trigger Lucy AI background activity effects
 * Call triggerTyping when user is typing
 * Call triggerNewMessage when a new message is sent/received
 */
export const useLucyActivityTrigger = () => {
  const triggerTyping = (isTyping: boolean) => {
    if (typeof window !== 'undefined' && (window as any).lucyActivitySync) {
      (window as any).lucyActivitySync.triggerTyping(isTyping);
    }
  };

  const triggerNewMessage = () => {
    if (typeof window !== 'undefined' && (window as any).lucyActivitySync) {
      (window as any).lucyActivitySync.triggerNewMessage();
    }
  };

  return { triggerTyping, triggerNewMessage };
};

/**
 * Hook to automatically trigger typing activity
 * Use in components with text input
 */
export const useTypingActivitySync = (isTyping: boolean) => {
  const { triggerTyping } = useLucyActivityTrigger();

  useEffect(() => {
    triggerTyping(isTyping);
  }, [isTyping, triggerTyping]);
};

/**
 * Hook to automatically trigger new message activity
 * Use in components that send/receive messages
 */
export const useMessageActivitySync = (messageCount: number) => {
  const { triggerNewMessage } = useLucyActivityTrigger();

  useEffect(() => {
    if (messageCount > 0) {
      triggerNewMessage();
    }
  }, [messageCount, triggerNewMessage]);
};
