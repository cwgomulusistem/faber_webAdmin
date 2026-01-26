'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================
// Types
// ============================================

interface UseOptimisticToggleOptions {
  /** Entity/Device ID for the toggle */
  entityId: string;
  /** Initial state (on/off) */
  initialState: boolean;
  /** Debounce delay in ms (prevents rapid API calls) */
  debounceMs?: number;
  /** Callback to execute the actual API call */
  onToggle: (newState: boolean) => Promise<void>;
  /** Optional callback on error */
  onError?: (error: Error, previousState: boolean) => void;
}

interface UseOptimisticToggleResult {
  /** Current optimistic state */
  state: boolean;
  /** Toggle function - updates UI immediately */
  toggle: () => void;
  /** Whether an API call is in progress */
  isPending: boolean;
  /** Last error if any */
  error: Error | null;
  /** Force set state (for external sync like WebSocket) */
  syncState: (newState: boolean) => void;
}

// ============================================
// Hook Implementation
// ============================================

export function useOptimisticToggle({
  entityId,
  initialState,
  debounceMs = 300,
  onToggle,
  onError,
}: UseOptimisticToggleOptions): UseOptimisticToggleResult {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track the previous state for rollback
  const previousStateRef = useRef(initialState);
  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track pending state to send (for debounce)
  const pendingStateRef = useRef<boolean | null>(null);
  // Mounted ref to prevent state updates after unmount
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Sync initial state when it changes externally
  useEffect(() => {
    if (!isPending) {
      setState(initialState);
      previousStateRef.current = initialState;
    }
  }, [initialState, isPending]);

  // Execute the actual API call
  const executeToggle = useCallback(
    async (targetState: boolean) => {
      if (!mountedRef.current) return;

      setIsPending(true);
      setError(null);

      try {
        await onToggle(targetState);
        if (mountedRef.current) {
          previousStateRef.current = targetState;
        }
      } catch (err) {
        if (mountedRef.current) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          // Rollback to previous state
          setState(previousStateRef.current);
          onError?.(error, previousStateRef.current);
        }
      } finally {
        if (mountedRef.current) {
          setIsPending(false);
          pendingStateRef.current = null;
        }
      }
    },
    [onToggle, onError]
  );

  // Toggle function with optimistic update and debounce
  const toggle = useCallback(() => {
    const newState = !state;

    // Optimistic update - UI changes immediately
    setState(newState);
    pendingStateRef.current = newState;

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      if (pendingStateRef.current !== null && mountedRef.current) {
        executeToggle(pendingStateRef.current);
      }
    }, debounceMs);
  }, [state, debounceMs, executeToggle]);

  // Sync state from external source (e.g., WebSocket)
  const syncState = useCallback((newState: boolean) => {
    if (!isPending) {
      setState(newState);
      previousStateRef.current = newState;
    }
  }, [isPending]);

  return {
    state,
    toggle,
    isPending,
    error,
    syncState,
  };
}

export default useOptimisticToggle;
