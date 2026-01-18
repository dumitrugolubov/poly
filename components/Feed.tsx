'use client';

import { useEffect, useState } from 'react';
import { WhaleTrade } from '@/lib/types';
import { fetchWhaleTrades } from '@/lib/polymarket';
import WhaleCard from './WhaleCard';
import { Loader2 } from 'lucide-react';

export default function Feed() {
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrades = async () => {
      setLoading(true);
      const data = await fetchWhaleTrades();
      setTrades(data);
      setLoading(false);
    };

    loadTrades();

    // Refresh every 30 seconds
    const interval = setInterval(loadTrades, 30000);
    return () => clearInterval(interval);
  }, []);

  // Download image using server-side generation (no oklab issues!)
  const handleDownload = async (trade: WhaleTrade) => {
    try {
      console.log('Generating image via server...');

      // Build OG image URL with trade parameters
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

      // Fetch the image from server
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      // Convert to blob and download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `polywave-whale-${trade.id.slice(0, 8)}-${Date.now()}.png`;
      link.href = url;
      link.click();

      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      console.log('Image downloaded successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate image: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Single column layout for wide horizontal tickets */}
        <div className="space-y-6">
          {trades.map((trade) => (
            <WhaleCard key={trade.id} trade={trade} onDownload={handleDownload} />
          ))}
        </div>
      </div>
    </div>
  );
}
