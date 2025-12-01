import { useEffect, useRef, useState, useCallback } from 'react';

interface UseInactivityTimeoutOptions {
  timeoutSeconds: number;
  onTimeout: () => void;
  enabled?: boolean;
}

export function useInactivityTimeout({
  timeoutSeconds,
  onTimeout,
  enabled = true,
}: UseInactivityTimeoutOptions) {
  const [remainingSeconds, setRemainingSeconds] = useState(timeoutSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    setRemainingSeconds(timeoutSeconds);
  }, [timeoutSeconds]);

  useEffect(() => {
    if (!enabled) {
      setRemainingSeconds(timeoutSeconds);
      return;
    }

    // Reset remaining seconds when enabled
    setRemainingSeconds(timeoutSeconds);

    // Countdown interval
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          onTimeout();
          return timeoutSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    // Event listeners for user activity
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

    const handleActivity = () => {
      setRemainingSeconds(timeoutSeconds);
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, timeoutSeconds, onTimeout]);

  return { remainingSeconds, resetTimer };
}
