'use client';

import { memo, useState, useMemo, useCallback } from 'react';
import { WhaleTrade } from '@/lib/types';
import { formatCurrency, formatTimestamp, shortenAddress, getIdenticonUrl, cn, calculateMultiplier } from '@/lib/utils';
import { Download, TrendingUp, Twitter, Link2, Check, ExternalLink, Loader2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface WhaleCardProps {
  trade: WhaleTrade;
  onDownload: (trade: WhaleTrade) => void;
  isDownloading?: boolean;
  isNew?: boolean;
}

const WhaleCard = memo(function WhaleCard({ trade, onDownload, isDownloading = false, isNew = false }: WhaleCardProps) {
  const [copied, setCopied] = useState(false);

  // Memoized calculations
  const outcomeColor = useMemo(() => {
    if (trade.outcome === 'Yes') return 'text-green-400';
    if (trade.outcome === 'No') return 'text-red-400';
    return 'text-yellow-400';
  }, [trade.outcome]);

  const payoutGradient = useMemo(() => {
    const multiplier = trade.betAmount > 0 ? trade.potentialPayout / trade.betAmount : 0;
    if (multiplier > 2.5) return 'text-gradient-gold';
    if (trade.outcome === 'Yes') return 'text-gradient-aurora';
    return 'text-gradient-red';
  }, [trade.potentialPayout, trade.betAmount, trade.outcome]);

  const glowColor = useMemo(() => {
    if (trade.outcome === 'Yes') return 'hover:shadow-green-500/50';
    if (trade.outcome === 'No') return 'hover:shadow-red-500/50';
    return 'hover:shadow-yellow-500/50';
  }, [trade.outcome]);

  const payoutTextSize = useMemo(() => {
    const formatted = formatCurrency(trade.potentialPayout);
    const length = formatted.length;
    if (length >= 12) return 'text-lg md:text-xl lg:text-2xl';
    if (length >= 10) return 'text-xl md:text-2xl lg:text-3xl';
    if (length >= 8) return 'text-2xl md:text-3xl lg:text-4xl';
    if (length >= 6) return 'text-3xl md:text-4xl lg:text-5xl';
    return 'text-4xl md:text-5xl lg:text-6xl';
  }, [trade.potentialPayout]);

  const isHighROI = useMemo(() => {
    return trade.betAmount > 0 && trade.potentialPayout > trade.betAmount * 2;
  }, [trade.potentialPayout, trade.betAmount]);

  const multiplierDisplay = useMemo(() => {
    return calculateMultiplier(trade.potentialPayout, trade.betAmount);
  }, [trade.potentialPayout, trade.betAmount]);

  // URLs
  const marketUrl = useMemo(() => {
    if (trade.eventSlug) return `https://polymarket.com/event/${trade.eventSlug}`;
    if (trade.marketSlug) return `https://polymarket.com/event/${trade.marketSlug}`;
    return null;
  }, [trade.eventSlug, trade.marketSlug]);

  const polymarketProfileUrl = `https://polymarket.com/profile/${trade.traderAddress}`;
  const internalWhaleUrl = `/whale/${trade.traderAddress}`;
  const internalMarketUrl = trade.marketSlug ? `/market/${trade.marketSlug}` : null;

  const handleCopyLink = useCallback(async () => {
    const shortUrl = `${window.location.origin}/trade/${trade.id}`;

    // Save trade to Redis (fire and forget)
    fetch(`/api/trade/${trade.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: trade.id,
        question: trade.question,
        betAmount: trade.betAmount,
        potentialPayout: trade.potentialPayout,
        outcome: trade.outcome,
        traderName: trade.traderName || '',
        traderAddress: trade.traderAddress,
        eventImage: trade.eventImage || '',
        timestamp: trade.timestamp,
      }),
    }).catch(() => {}); // Ignore errors, link still works with fallback

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shortUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [trade]);

  const handleDownload = useCallback(() => {
    if (!isDownloading) {
      onDownload(trade);
    }
  }, [trade, onDownload, isDownloading]);

  return (
    <div className="relative group">
      {/* NEW badge */}
      {isNew && (
        <div className="absolute -top-2 -left-2 z-20">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
            NEW
          </div>
        </div>
      )}
      <div
        id={`whale-card-${trade.id}`}
        className={cn(
          'glassmorphism rounded-xl overflow-hidden transition-all duration-300',
          'hover:scale-[1.01] hover:shadow-2xl',
          glowColor,
          'flex flex-col p-6 gap-4',
          'md:flex-row md:p-8 md:gap-8 md:min-h-[280px]',
          isNew && 'ring-2 ring-yellow-400/50 animate-[pulse_2s_ease-in-out_3]'
        )}
      >
        {/* LEFT COLUMN - Content */}
        <div className="flex-1 md:w-[70%] flex flex-col justify-between">
          {/* Trader Info */}
          <Link
            href={internalWhaleUrl}
            className="flex items-center gap-3 mb-4 hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
          >
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
                <p className="text-sm md:text-base text-white/90 font-semibold hover:text-white transition-colors">
                  {trade.traderName || shortenAddress(trade.traderAddress)}
                </p>
                <User size={14} className="text-purple-400" />
                <a
                  href={polymarketProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-white/40 hover:text-white/60 transition-colors"
                  title="View on Polymarket"
                >
                  <ExternalLink size={12} />
                </a>
                {trade.traderTwitterHandle && (
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(`https://twitter.com/${trade.traderTwitterHandle}`, '_blank');
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Twitter size={14} />
                  </span>
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
          </Link>

          {/* Market Question */}
          {internalMarketUrl ? (
            <Link
              href={internalMarketUrl}
              className="flex-1 flex items-center gap-4 hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
            >
              {trade.eventImage && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30">
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
              <div className="flex items-start gap-2">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight hover:text-white/90 transition-colors line-clamp-3">
                  {trade.question}
                </h3>
                <TrendingUp size={16} className="text-purple-400 flex-shrink-0 mt-1" />
                {marketUrl && (
                  <a
                    href={marketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-white/40 hover:text-white/60 transition-colors"
                    title="View on Polymarket"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </Link>
          ) : (
            <div className="flex-1 flex items-center gap-4 p-2 -m-2">
              {trade.eventImage && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30">
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
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight line-clamp-3">
                {trade.question}
              </h3>
            </div>
          )}

          {/* Outcome Badge */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn(
              'px-4 py-2 rounded-lg font-bold text-lg',
              trade.outcome === 'Yes' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            )}>
              {trade.outcome}
            </div>
            {isHighROI && (
              <div className="flex items-center gap-1 text-yellow-400 text-sm bg-yellow-500/10 px-3 py-2 rounded-lg">
                <TrendingUp size={14} />
                <span className="font-semibold">High ROI</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Financials */}
        <Link
          href={internalWhaleUrl}
          className="md:w-[30%] flex flex-col justify-center items-end text-right border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-4 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
        >
          <div className="mb-4 w-full">
            <p className="text-sm text-white/50 mb-1 uppercase tracking-wider flex items-center justify-end gap-1">
              Bet Amount
              <User size={10} className="text-purple-400" />
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              {formatCurrency(trade.betAmount)}
            </p>
          </div>

          <div className="w-full bg-gradient-to-br from-white/10 to-white/5 rounded-lg p-4 md:p-5">
            <p className="text-xs md:text-sm text-white/60 mb-1 uppercase tracking-wider">
              Potential Payout
            </p>
            <p className={cn('font-black leading-tight', payoutTextSize, payoutGradient)}>
              {formatCurrency(trade.potentialPayout)}
            </p>
            <div className="mt-2 text-sm text-white/40">
              {multiplierDisplay}x return
            </div>
          </div>
        </Link>

        {/* Branding Watermark */}
        <div className="absolute bottom-4 right-4 opacity-30 text-xs font-mono text-white/60">
          <span className="font-bold tracking-wider">POLYWAVE.TRADE</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleCopyLink}
          className={cn(
            'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
            'text-white font-semibold py-2 px-4 rounded-lg',
            'transition-all duration-200 flex items-center gap-2',
            'shadow-lg hover:shadow-xl'
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

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={cn(
            'bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700',
            'text-white font-semibold py-2 px-4 rounded-lg',
            'transition-all duration-200 flex items-center gap-2',
            'shadow-lg hover:shadow-xl',
            isDownloading && 'opacity-50 cursor-not-allowed'
          )}
          title="Download as PNG"
        >
          {isDownloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="hidden md:inline">Saving...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span className="hidden md:inline">Download</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
});

export default WhaleCard;
