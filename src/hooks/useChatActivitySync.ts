import { useState, useEffect } from 'react';

interface ChatActivityState {
  isTyping: boolean;
  hasNewMessage: boolean;
  activityLevel: 'idle' | 'low' | 'medium' | 'high';
}

export const useChatActivitySync = () => {
  const [activity, setActivity] = useState<ChatActivityState>({
    isTyping: false,
    hasNewMessage: false,
    activityLevel: 'idle'
  });

  const triggerTyping = (typing: boolean) => {
    setActivity(prev => ({
      ...prev,
      isTyping: typing,
      activityLevel: typing ? 'medium' : 'idle'
    }));
  };

  const triggerNewMessage = () => {
    setActivity(prev => ({
      ...prev,
      hasNewMessage: true,
      activityLevel: 'high'
    }));

    setTimeout(() => {
      setActivity(prev => ({ ...prev, hasNewMessage: false, activityLevel: 'low' }));
    }, 2000);
  };

  return {
    activity,
    triggerTyping,
    triggerNewMessage
  };
};
