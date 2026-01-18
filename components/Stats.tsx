'use client';

import { WhaleTrade } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

interface StatsProps {
  trades: WhaleTrade[];
}

export default function Stats({ trades }: StatsProps) {
  const totalVolume = trades.reduce((sum, trade) => sum + trade.betAmount, 0);
  const totalPayout = trades.reduce((sum, trade) => sum + trade.potentialPayout, 0);
  const avgBet = totalVolume / trades.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <DollarSign className="text-green-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-white/60">Total Volume</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalVolume)}</p>
          </div>
        </div>
      </div>

      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <TrendingUp className="text-purple-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-white/60">Potential Payout</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalPayout)}</p>
          </div>
        </div>
      </div>

      <div className="glassmorphism rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Activity className="text-yellow-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-white/60">Avg Bet Size</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(avgBet)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
