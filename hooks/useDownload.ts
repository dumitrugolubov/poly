'use client';

import { useState, useCallback } from 'react';
import { WhaleTrade } from '@/lib/types';

interface UseDownloadReturn {
  downloading: boolean;
  error: string | null;
  downloadTradeImage: (trade: WhaleTrade) => Promise<void>;
}

export function useDownload(): UseDownloadReturn {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadTradeImage = useCallback(async (trade: WhaleTrade) => {
    setDownloading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        question: trade.question,
        betAmount: trade.betAmount.toString(),
        potentialPayout: trade.potentialPayout.toString(),
        outcome: trade.outcome,
        traderName: trade.traderName || '',
        traderAddress: trade.traderAddress,
        eventImage: trade.eventImage || '',
      });

      const imageUrl = `/api/og?${params.toString()}`;
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `polywave-whale-${trade.id.slice(0, 8)}-${Date.now()}.png`;
      link.href = url;
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  }, []);

  return { downloading, error, downloadTradeImage };
}
