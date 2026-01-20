'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WhaleTrade } from '@/lib/types';
import { fetchWhaleTrades } from '@/lib/polymarket';

const POLLING_INTERVAL_MS = 30 * 1000; // 30 seconds

interface UseTradesReturn {
  trades: WhaleTrade[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useTrades(): UseTradesReturn {
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // AbortController ref for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadTrades = useCallback(async (isInitial = false) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (isInitial) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchWhaleTrades();

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setTrades(data);
      setLastUpdated(new Date());
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to load trades';
      setError(message);
      console.error('Failed to fetch trades:', err);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadTrades(false);
  }, [loadTrades]);

  useEffect(() => {
    // Initial load
    loadTrades(true);

    // Set up polling
    const interval = setInterval(() => {
      loadTrades(false);
    }, POLLING_INTERVAL_MS);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadTrades]);

  return { trades, loading, error, refresh, lastUpdated };
}
