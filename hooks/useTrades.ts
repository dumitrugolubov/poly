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
  newTradeIds: Set<string>;
  secondsUntilRefresh: number;
  isLive: boolean;
}

export function useTrades(): UseTradesReturn {
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newTradeIds, setNewTradeIds] = useState<Set<string>>(new Set());
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30);
  const [isLive, setIsLive] = useState(true);

  // Track seen trade IDs
  const seenTradeIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

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

      // Track new trades (not on first load)
      if (!isFirstLoadRef.current) {
        const newIds = new Set<string>();
        for (const trade of data) {
          if (!seenTradeIdsRef.current.has(trade.id)) {
            newIds.add(trade.id);
          }
        }
        if (newIds.size > 0) {
          setNewTradeIds(newIds);
          // Clear new badge after 10 seconds
          setTimeout(() => setNewTradeIds(new Set()), 10000);
        }
      }

      // Update seen trades
      for (const trade of data) {
        seenTradeIdsRef.current.add(trade.id);
      }
      isFirstLoadRef.current = false;

      setTrades(data);
      setLastUpdated(new Date());
      setSecondsUntilRefresh(30);
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
    setSecondsUntilRefresh(30);
    await loadTrades(false);
  }, [loadTrades]);

  // Handle visibility change - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsLive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isLive) return;

    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [isLive]);

  useEffect(() => {
    // Initial load
    loadTrades(true);

    // Set up polling (only when tab is visible)
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadTrades(false);
      }
    }, POLLING_INTERVAL_MS);

    // Cleanup
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadTrades]);

  return { trades, loading, error, refresh, lastUpdated, newTradeIds, secondsUntilRefresh, isLive };
}
