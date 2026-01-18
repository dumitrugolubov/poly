'use client';

import { WhaleTrade } from '@/lib/types';
import { formatCurrency, formatTimestamp, shortenAddress, getIdenticonUrl, cn } from '@/lib/utils';
import { Download, TrendingUp, Twitter, Link2, Check } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface WhaleCardProps {
  trade: WhaleTrade;
  onDownload: (trade: WhaleTrade) => void;
}

export default function WhaleCard({ trade, onDownload }: WhaleCardProps) {
  const [copied, setCopied] = useState(false);

  const getOutcomeColor = () => {
    if (trade.outcome === 'Yes') return 'text-green-400';
    if (trade.outcome === 'No') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getPayoutGradient = () => {
    const multiplier = trade.potentialPayout / trade.betAmount;
    if (multiplier > 2.5) return 'text-gradient-gold';
    if (trade.outcome === 'Yes') return 'text-gradient-aurora';
    return 'text-gradient-red';
  };

  const getGlowColor = () => {
    if (trade.outcome === 'Yes') return 'hover:shadow-green-500/50';
    if (trade.outcome === 'No') return 'hover:shadow-red-500/50';
    return 'hover:shadow-yellow-500/50';
  };

  const isPayout = trade.potentialPayout > trade.betAmount * 2;

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}?trade=${trade.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="relative group">
      {/* Horizontal Ticket Card */}
      <div
        id={`whale-card-${trade.id}`}
        className={cn(
          'glassmorphism rounded-xl overflow-hidden transition-all duration-300',
          'hover:scale-[1.01] hover:shadow-2xl',
          getGlowColor(),
          // Mobile: Vertical layout
          'flex flex-col p-6 gap-4',
          // Desktop: Horizontal layout (16:9-ish aspect ratio)
          'md:flex-row md:p-8 md:gap-8 md:min-h-[280px]'
        )}
      >
        {/* LEFT COLUMN (60% on desktop) - Content */}
        <div className="flex-1 md:w-[60%] flex flex-col justify-between">
          {/* Trader Info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ring-2 ring-white/20">
              <Image
                src={trade.traderProfileImage || getIdenticonUrl(trade.traderAddress)}
                alt="Trader"
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized={!trade.traderProfileImage}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base text-white/90 font-semibold">
                  {trade.traderName || shortenAddress(trade.traderAddress)}
                </p>
                {trade.traderTwitterHandle && (
                  <a
                    href={`https://twitter.com/${trade.traderTwitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Twitter size={14} />
                  </a>
                )}
              </div>
              {!trade.traderName && (
                <p className="text-xs font-mono text-white/60">
                  {shortenAddress(trade.traderAddress)}
                </p>
              )}
              <p className="text-xs text-white/40 mt-0.5">
                {formatTimestamp(trade.timestamp)}
              </p>
            </div>
          </div>

          {/* Market Question with Event Image - HERO */}
          <div className="flex-1 flex items-center gap-4">
            {trade.eventImage && (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                <Image
                  src={trade.eventImage}
                  alt="Event"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            )}
            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
              {trade.question}
            </h3>
          </div>

          {/* Outcome Badge */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              'px-4 py-2 rounded-lg font-bold text-lg',
              trade.outcome === 'Yes' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            )}>
              {trade.outcome}
            </div>
            {isPayout && (
              <div className="flex items-center gap-1 text-yellow-400 text-sm bg-yellow-500/10 px-3 py-2 rounded-lg">
                <TrendingUp size={14} />
                <span className="font-semibold">High ROI</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (40% on desktop) - Financials */}
        <div className="md:w-[40%] flex flex-col justify-center items-end text-right border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
          {/* Bet Amount */}
          <div className="mb-6 w-full">
            <p className="text-sm text-white/50 mb-2 uppercase tracking-wider">Bet Amount</p>
            <p className="text-3xl md:text-4xl font-bold text-white">
              {formatCurrency(trade.betAmount)}
            </p>
          </div>

          {/* Potential Payout - MASSIVE HERO */}
          <div className="w-full bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-6 mb-4">
            <p className="text-xs md:text-sm text-white/60 mb-2 uppercase tracking-wider">
              Potential Payout
            </p>
            <p className={cn(
              'text-4xl md:text-5xl lg:text-6xl font-black leading-none',
              getPayoutGradient()
            )}>
              {formatCurrency(trade.potentialPayout)}
            </p>
            <div className="mt-3 text-sm text-white/40">
              {(trade.potentialPayout / trade.betAmount).toFixed(2)}x return
            </div>
          </div>
        </div>

        {/* Branding Watermark - Bottom Right (No Debug Labels) */}
        <div className="absolute bottom-4 right-4 opacity-30 text-xs font-mono text-white/60">
          <span className="font-bold tracking-wider">POLYWAVE.TRADE</span>
        </div>
      </div>

      {/* Action Buttons - Appear on hover */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className={cn(
            'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
            'text-white font-semibold py-2 px-4 rounded-lg',
            'transition-all duration-200 flex items-center gap-2',
            'shadow-lg hover:shadow-xl',
            'relative'
          )}
          title="Copy link to trade"
        >
          {copied ? (
            <>
              <Check size={16} />
              <span className="hidden md:inline">Copied!</span>
            </>
          ) : (
            <>
              <Link2 size={16} />
              <span className="hidden md:inline">Copy Link</span>
            </>
          )}
        </button>

        {/* Download Button */}
        <button
          onClick={() => onDownload(trade)}
          className={cn(
            'bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700',
            'text-white font-semibold py-2 px-4 rounded-lg',
            'transition-all duration-200 flex items-center gap-2',
            'shadow-lg hover:shadow-xl'
          )}
          title="Download as PNG"
        >
          <Download size={16} />
          <span className="hidden md:inline">Download</span>
        </button>
      </div>
    </div>
  );
}
