'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { formatCurrency, shortenAddress, getIdenticonUrl, cn } from '@/lib/utils';

interface MarketData {
  id: string;
  conditionId: string;
  question: string;
  description: string;
  slug: string;
  image: string;
  category: string;
  outcomes: string[];
  prices: number[];
  volume: number;
  volume24h: number;
  liquidity: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  priceChange24h: number;
  bestBid: number;
  bestAsk: number;
  holders: {
    address: string;
    name: string;
    profileImage: string;
    amount: number;
    outcome: string;
  }[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function MarketPage({ params }: PageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [market, setMarket] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    async function fetchMarket() {
      try {
        const res = await fetch(`/api/market/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setMarket(data);
        }
      } catch (error) {
        console.error('Failed to fetch market:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarket();
  }, [slug]);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || !slug) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="glassmorphism rounded-xl p-8 animate-pulse">
              <div className="flex gap-6 mb-8">
                <div className="w-32 h-32 bg-white/10 rounded-xl" />
                <div className="flex-1">
                  <div className="h-8 bg-white/10 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/10 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!market) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Market not found</h2>
            <p className="text-white/60 mb-6">This market doesn&apos;t exist or has been removed</p>
            <Link href="/markets" className="text-purple-400 hover:text-purple-300">
              ← Browse all markets
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const polymarketUrl = `https://polymarket.com/event/${market.slug}`;

  return (
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/markets"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to markets</span>
          </Link>

          {/* Market Header */}
          <div className="glassmorphism rounded-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              {market.image && (
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                  <Image
                    src={market.image}
                    alt={market.question}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {market.question}
                  </h1>
                  <a
                    href={polymarketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors text-sm font-medium flex-shrink-0"
                  >
                    <span>Trade on Polymarket</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-sm text-white/60">
                    {market.category}
                  </span>
                  <span className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium',
                    market.active && !market.closed
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-red-500/20 text-red-400'
                  )}>
                    {market.closed ? 'Closed' : market.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-white/40">
                    <Clock size={14} />
                    {formatDate(market.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {market.outcomes.map((outcome, i) => (
                <div
                  key={outcome}
                  className={cn(
                    'p-6 rounded-xl text-center',
                    outcome.toLowerCase() === 'yes'
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  )}
                >
                  <div className="text-lg text-white/60 mb-2">{outcome}</div>
                  <div className={cn(
                    'text-5xl font-bold',
                    outcome.toLowerCase() === 'yes' ? 'text-green-400' : 'text-red-400'
                  )}>
                    {Math.round(market.prices[i] * 100)}¢
                  </div>
                  <div className="text-sm text-white/40 mt-2">
                    {(market.prices[i] * 100).toFixed(1)}% chance
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  <BarChart3 size={16} />
                  24h Volume
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatVolume(market.volume24h)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  <DollarSign size={16} />
                  Total Volume
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatVolume(market.volume)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  <DollarSign size={16} />
                  Liquidity
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatVolume(market.liquidity)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  {market.priceChange24h >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  24h Change
                </div>
                <div className={cn(
                  'text-2xl font-bold',
                  market.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {market.priceChange24h >= 0 ? '+' : ''}{(market.priceChange24h * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Description */}
            {market.description && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-white/60 whitespace-pre-wrap">{market.description}</p>
              </div>
            )}
          </div>

          {/* Top Holders */}
          {market.holders.length > 0 && (
            <div className="glassmorphism rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-purple-400" size={24} />
                <h2 className="text-xl font-bold text-white">Top Holders</h2>
              </div>
              <div className="space-y-2">
                {market.holders.map((holder, index) => (
                  <Link
                    key={`${holder.address}-${holder.outcome}`}
                    href={`/whale/${holder.address}${holder.name || holder.profileImage ? `?${new URLSearchParams({
                      ...(holder.name && { name: holder.name }),
                      ...(holder.profileImage && { image: holder.profileImage }),
                    }).toString()}` : ''}`}
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {/* Rank */}
                    <div className={cn(
                      'w-6 text-center font-bold',
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-amber-600' :
                      'text-white/40'
                    )}>
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10">
                      <Image
                        src={holder.profileImage || getIdenticonUrl(holder.address)}
                        alt=""
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        unoptimized={!holder.profileImage}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">
                          {holder.name || shortenAddress(holder.address)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-xs font-medium',
                          holder.outcome === 'Yes'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        )}>
                          {holder.outcome}
                        </span>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        {holder.amount >= 1000000
                          ? `${(holder.amount / 1000000).toFixed(2)}M`
                          : holder.amount >= 1000
                          ? `${(holder.amount / 1000).toFixed(1)}K`
                          : holder.amount.toFixed(0)}
                      </div>
                      <div className="text-xs text-white/40">shares</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
