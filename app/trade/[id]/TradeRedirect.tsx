'use client';

import { WhaleTrade } from '@/lib/types';
import { useDownload } from '@/hooks/useDownload';
import { safeParseFloat, isValidOutcome } from '@/lib/utils';
import WhaleCard from '@/components/WhaleCard';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

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
  const { downloadTradeImage, downloading, error: downloadError } = useDownload();

  // Construct trade object from URL params with safe parsing
  const trade: WhaleTrade = {
    id: tradeId,
    question: question || 'Whale Trade on Polymarket',
    betAmount: safeParseFloat(betAmount, 0),
    potentialPayout: safeParseFloat(potentialPayout, 0),
    outcome: isValidOutcome(outcome) ? outcome : 'Yes',
    traderName: traderName || undefined,
    traderAddress: traderAddress || '',
    eventImage: eventImage || undefined,
    timestamp: Math.floor(Date.now() / 1000),
    marketId: tradeId,
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

          {/* Download error toast */}
          {downloadError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-200 text-sm">Failed to download image: {downloadError}</span>
            </div>
          )}

          {/* Trade card */}
          <WhaleCard
            trade={trade}
            onDownload={downloadTradeImage}
            isDownloading={downloading}
          />

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
