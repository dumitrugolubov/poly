'use client';

import { WhaleTrade } from '@/lib/types';
import WhaleCard from '@/components/WhaleCard';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface TradeViewProps {
  tradeId: string;
  question?: string;
  betAmount?: string;
  potentialPayout?: string;
  outcome?: string;
  traderName?: string;
  traderAddress?: string;
  eventImage?: string;
}

export default function TradeRedirect({
  tradeId,
  question,
  betAmount,
  potentialPayout,
  outcome,
  traderName,
  traderAddress,
  eventImage,
}: TradeViewProps) {
  // Construct trade object from URL params
  const trade: WhaleTrade = {
    id: tradeId,
    question: question || 'Whale Trade on Polymarket',
    betAmount: parseFloat(betAmount || '0'),
    potentialPayout: parseFloat(potentialPayout || '0'),
    outcome: (outcome as 'Yes' | 'No') || 'Yes',
    traderName: traderName || undefined,
    traderAddress: traderAddress || '',
    eventImage: eventImage || undefined,
    timestamp: Math.floor(Date.now() / 1000),
    marketId: tradeId,
  };

  // Download handler (same as Feed.tsx)
  const handleDownload = async (trade: WhaleTrade) => {
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
      if (!response.ok) throw new Error('Failed to generate image');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `polywave-whale-${trade.id.slice(0, 8)}-${Date.now()}.png`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>View all whale trades</span>
          </Link>

          {/* Trade card */}
          <WhaleCard trade={trade} onDownload={handleDownload} />

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-white/40 mb-4">Track more whale trades in real-time</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all"
            >
              Explore All Trades
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
