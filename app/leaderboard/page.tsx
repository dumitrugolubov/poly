'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { formatCurrency, shortenAddress, getIdenticonUrl, cn } from '@/lib/utils';
import { LeaderboardEntry } from '@/lib/types';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="text-yellow-400" size={24} />;
      case 2:
        return <Medal className="text-gray-300" size={24} />;
      case 3:
        return <Award className="text-amber-600" size={24} />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <main className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <Trophy className="text-yellow-400" />
              Whale Leaderboard
            </h1>
            <p className="text-white/60">Top traders by volume from recent whale trades</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="glassmorphism rounded-xl p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white/10 rounded" />
                    <div className="w-12 h-12 bg-white/10 rounded-full" />
                    <div className="flex-1">
                      <div className="h-5 bg-white/10 rounded w-32 mb-2" />
                      <div className="h-4 bg-white/10 rounded w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leaderboard */}
          {!loading && (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <Link
                  key={entry.address}
                  href={`/whale/${entry.address}`}
                  className={cn(
                    'block rounded-xl p-4 border transition-all hover:scale-[1.01]',
                    getRankStyle(entry.rank)
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-10 flex justify-center">
                      {getRankIcon(entry.rank) || (
                        <span className="text-xl font-bold text-white/40">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={cn(
                      'w-12 h-12 rounded-full overflow-hidden ring-2',
                      entry.rank === 1 ? 'ring-yellow-400' :
                      entry.rank === 2 ? 'ring-gray-300' :
                      entry.rank === 3 ? 'ring-amber-600' :
                      'ring-white/20'
                    )}>
                      <Image
                        src={entry.profileImage || getIdenticonUrl(entry.address)}
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        unoptimized={!entry.profileImage}
                      />
                    </div>

                    {/* Name & Address */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={cn(
                          'font-semibold truncate',
                          entry.rank <= 3 ? 'text-white' : 'text-white/90'
                        )}>
                          {entry.name || shortenAddress(entry.address)}
                        </h3>
                        <ExternalLink size={14} className="text-white/30 flex-shrink-0" />
                      </div>
                      {entry.name && (
                        <p className="text-xs font-mono text-white/40 truncate">
                          {shortenAddress(entry.address)}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 text-right">
                      <div>
                        <div className="text-xs text-white/40 mb-1">Volume</div>
                        <div className={cn(
                          'font-bold',
                          entry.rank === 1 ? 'text-yellow-400' :
                          entry.rank === 2 ? 'text-gray-300' :
                          entry.rank === 3 ? 'text-amber-500' :
                          'text-white'
                        )}>
                          {formatCurrency(entry.totalVolume)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-white/40 mb-1">Trades</div>
                        <div className="font-semibold text-white">
                          {entry.tradesCount}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && leaderboard.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No data yet</h2>
              <p className="text-white/60">Leaderboard will populate as whale trades are collected</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-8 text-center text-sm text-white/40">
            Based on whale trades ($5,000+) collected in the last 30 days
          </div>
        </div>
      </div>
    </main>
  );
}
