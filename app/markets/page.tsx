'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, BarChart3, ExternalLink, Clock, Users } from 'lucide-react';
import Image from 'next/image';
import Header from '@/components/Header';
import HoldersModal from '@/components/HoldersModal';
import { cn } from '@/lib/utils';

interface Market {
  id: string;
  question: string;
  slug: string;
  image: string;
  category: string;
  volume: number;
  volume24h: number;
  liquidity: number;
  outcomes: string[];
  prices: number[];
  endDate: string;
  priceChange24h: number;
  conditionId?: string;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'volume24hr' | 'volumeNum' | 'liquidityNum'>('volume24hr');
  const [selectedMarket, setSelectedMarket] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await fetch(`/api/markets?limit=30&sortBy=${sortBy}`);
        if (res.ok) {
          const data = await res.json();
          setMarkets(data);
        }
      } catch (error) {
        console.error('Failed to fetch markets:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
  }, [sortBy]);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(0)}K`;
    return `$${vol.toFixed(0)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <TrendingUp className="text-green-400" />
                Trending Markets
              </h1>
              <p className="text-white/60">Hottest prediction markets on Polymarket</p>
            </div>

            {/* Sort options */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setSortBy('volume24hr')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  sortBy === 'volume24hr'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                24h Volume
              </button>
              <button
                onClick={() => setSortBy('volumeNum')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  sortBy === 'volumeNum'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                Total Volume
              </button>
              <button
                onClick={() => setSortBy('liquidityNum')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  sortBy === 'liquidityNum'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                )}
              >
                Liquidity
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glassmorphism rounded-xl p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-6 bg-white/10 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-white/10 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Markets Grid */}
          {!loading && (
            <div className="grid gap-4">
              {markets.map((market, index) => (
                <div
                  key={market.id}
                  className="glassmorphism rounded-xl p-6 hover:scale-[1.01] transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Rank & Image */}
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-white/30 w-8">
                        #{index + 1}
                      </div>
                      {market.image && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          <Image
                            src={market.image}
                            alt={market.question}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>

                    {/* Question & Category */}
                    <a
                      href={`https://polymarket.com/event/${market.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-start gap-2">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                          {market.question}
                        </h3>
                        <ExternalLink size={16} className="text-white/30 flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
                          {market.category || 'General'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/40">
                          <Clock size={12} />
                          {formatDate(market.endDate)}
                        </span>
                      </div>
                    </a>

                    {/* Prices */}
                    <div className="flex gap-4 md:gap-6">
                      {market.outcomes.map((outcome, i) => (
                        <div key={outcome} className="text-center">
                          <div className={cn(
                            'text-xl font-bold',
                            outcome.toLowerCase() === 'yes' ? 'text-green-400' : 'text-red-400'
                          )}>
                            {Math.round(market.prices[i] * 100)}¢
                          </div>
                          <div className="text-xs text-white/40">{outcome}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 md:gap-6 text-right">
                      <div>
                        <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                          <BarChart3 size={12} />
                          24h Vol
                        </div>
                        <div className="text-white font-semibold">
                          {formatVolume(market.volume24h)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                          <DollarSign size={12} />
                          Liquidity
                        </div>
                        <div className="text-white font-semibold">
                          {formatVolume(market.liquidity)}
                        </div>
                      </div>
                    </div>

                    {/* Holders Button */}
                    <button
                      onClick={() => setSelectedMarket({ id: market.conditionId || market.id, title: market.question })}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors text-sm font-medium"
                      title="View top holders"
                    >
                      <Users size={16} />
                      <span className="hidden sm:inline">Holders</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && markets.length === 0 && (
            <div className="text-center py-20">
              <TrendingUp className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No markets found</h2>
              <p className="text-white/60">Check back later for trending markets</p>
            </div>
          )}
        </div>
      </div>

      {/* Holders Modal */}
      <HoldersModal
        marketId={selectedMarket?.id || ''}
        marketTitle={selectedMarket?.title || ''}
        isOpen={!!selectedMarket}
        onClose={() => setSelectedMarket(null)}
      />
    </main>
  );
}
