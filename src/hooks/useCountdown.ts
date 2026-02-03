// useCountdown hook
// Countdown timer for lockout functionality

import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  onComplete?: () => void;
}

interface UseCountdownReturn {
  remaining: number;
  isActive: boolean;
  start: (targetTime: number) => void;
  stop: () => void;
  formatTime: (seconds: number) => string;
}

/**
 * Countdown timer hook for lockout UI
 * @param targetTime - Unix timestamp (milliseconds) when countdown ends
 * @param options - Optional callbacks
 * @returns Countdown state and controls
 */
export function useCountdown(
  initialTargetTime: number | null = null,
  options: UseCountdownOptions = {}
): UseCountdownReturn {
  const [targetTime, setTargetTime] = useState<number | null>(initialTargetTime);
  const [remaining, setRemaining] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const calculateRemaining = useCallback(() => {
    if (!targetTime) return 0;
    const diff = Math.max(0, targetTime - Date.now());
    return Math.ceil(diff / 1000);
  }, [targetTime]);

  useEffect(() => {
    if (!targetTime) {
      setRemaining(0);
      setIsActive(false);
      return;
    }

    // Initial calculation
    const initialRemaining = calculateRemaining();
    setRemaining(initialRemaining);
    setIsActive(initialRemaining > 0);

    if (initialRemaining <= 0) {
      options.onComplete?.();
      return;
    }

    // Update every second
    const interval = setInterval(() => {
      const newRemaining = calculateRemaining();
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        clearInterval(interval);
        setIsActive(false);
        options.onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, calculateRemaining, options]);

  const start = useCallback((newTargetTime: number) => {
    setTargetTime(newTargetTime);
  }, []);

  const stop = useCallback(() => {
    setTargetTime(null);
    setRemaining(0);
    setIsActive(false);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    if (seconds <= 0) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    remaining,
    isActive,
    start,
    stop,
    formatTime,
  };
}

export default useCountdown;
