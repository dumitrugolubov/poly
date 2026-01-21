'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, DollarSign, Activity, Wallet, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { formatCurrency, shortenAddress, getIdenticonUrl, cn, formatTimestamp } from '@/lib/utils';
import { WhaleProfile, Position, Activity as ActivityType } from '@/lib/types';

interface PageProps {
  params: Promise<{ address: string }>;
}

export default function WhaleProfilePage({ params }: PageProps) {
  const searchParams = useSearchParams();
  const [address, setAddress] = useState<string | null>(null);
  const [profile, setProfile] = useState<WhaleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'positions' | 'activity'>('positions');

  // Get name and image from query params (passed from WhaleCard)
  const queryName = searchParams.get('name') || '';
  const queryImage = searchParams.get('image') || '';

  // Resolve params promise
  useEffect(() => {
    params.then((p) => setAddress(p.address));
  }, [params]);

  useEffect(() => {
    if (!address) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/whale/${address}`);
        if (res.ok) {
          const data = await res.json();
          // Use query params as fallback if API doesn't return name/image
          if (!data.name && queryName) {
            data.name = queryName;
          }
          if (!data.profileImage && queryImage) {
            data.profileImage = queryImage;
          }
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [address, queryName, queryImage]);

  if (loading || !address) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="glassmorphism rounded-xl p-8 animate-pulse">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-white/10 rounded-full" />
                <div>
                  <div className="h-8 bg-white/10 rounded w-48 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-32" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-white/10 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center py-20">
            <Wallet className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Trader not found</h2>
            <p className="text-white/60 mb-6">No data available for this address</p>
            <Link href="/" className="text-purple-400 hover:text-purple-300">
              ← Back to whale trades
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to whale trades</span>
          </Link>

          {/* Profile Header */}
          <div className="glassmorphism rounded-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 ring-4 ring-purple-500/30">
                <Image
                  src={profile.profileImage || getIdenticonUrl(profile.address)}
                  alt="Trader"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                  unoptimized={!profile.profileImage}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-1">
                  {profile.name || shortenAddress(profile.address)}
                </h1>
                <a
                  href={`https://polymarket.com/profile/${profile.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-white/60 hover:text-purple-400 transition-colors font-mono text-sm"
                >
                  {profile.address}
                  <ExternalLink size={14} />
                </a>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/40 mb-1">Portfolio Value</div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(profile.totalValue)}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  <Activity size={16} />
                  Total Trades
                </div>
                <div className="text-2xl font-bold text-white">
                  {profile.stats.totalTrades}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  <DollarSign size={16} />
                  Total Volume
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(profile.stats.totalVolume)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  <Target size={16} />
                  Avg Bet Size
                </div>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(profile.stats.avgBetSize)}
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                  {profile.stats.pnl >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  P&L
                </div>
                <div className={cn(
                  'text-2xl font-bold',
                  profile.stats.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                )}>
                  {profile.stats.pnl >= 0 ? '+' : ''}{formatCurrency(profile.stats.pnl)}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('positions')}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-colors',
                activeTab === 'positions'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              )}
            >
              Positions ({profile.positions.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-colors',
                activeTab === 'activity'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              )}
            >
              Recent Activity ({profile.recentActivity.length})
            </button>
          </div>

          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div className="space-y-3">
              {profile.positions.map((position: Position) => (
                <a
                  key={position.id}
                  href={position.marketSlug ? `https://polymarket.com/event/${position.marketSlug}` : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glassmorphism rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:scale-[1.01] transition-all"
                >
                  {position.marketImage && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      <Image
                        src={position.marketImage}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium line-clamp-1">{position.marketTitle}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        position.outcome?.toLowerCase() === 'yes'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      )}>
                        {position.outcome || 'Unknown'}
                      </span>
                      <span className="text-white/40 text-sm">
                        {(position.size || 0).toFixed(0)} shares @ {((position.avgPrice || 0) * 100).toFixed(0)}¢
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-6 text-right">
                    <div>
                      <div className="text-xs text-white/40 mb-1">Value</div>
                      <div className="text-white font-semibold">{formatCurrency(position.value)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 mb-1">P&L</div>
                      <div className={cn(
                        'font-semibold',
                        position.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                      </div>
                    </div>
                  </div>
                </a>
              ))}

              {profile.positions.length === 0 && (
                <div className="text-center py-12 text-white/40">
                  No open positions
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {profile.recentActivity.map((activity: ActivityType) => (
                <div
                  key={activity.id}
                  className="glassmorphism rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    activity.side === 'BUY' ? 'bg-green-500/20' : 'bg-red-500/20'
                  )}>
                    {activity.side === 'BUY' ? (
                      <TrendingUp className="text-green-400" size={20} />
                    ) : (
                      <TrendingDown className="text-red-400" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium line-clamp-1">{activity.marketTitle}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-white/40">
                      <span>{activity.type || 'TRADE'}</span>
                      {activity.outcome && (
                        <>
                          <span>•</span>
                          <span className={activity.outcome?.toLowerCase() === 'yes' ? 'text-green-400' : 'text-red-400'}>
                            {activity.outcome}
                          </span>
                        </>
                      )}
                      {activity.timestamp > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatTimestamp(activity.timestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'font-semibold',
                      activity.side === 'BUY' ? 'text-green-400' : 'text-red-400'
                    )}>
                      {activity.side === 'BUY' ? '+' : '-'}{formatCurrency(activity.usdAmount)}
                    </div>
                  </div>
                </div>
              ))}

              {profile.recentActivity.length === 0 && (
                <div className="text-center py-12 text-white/40">
                  No recent activity
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
