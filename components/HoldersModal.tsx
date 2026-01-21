'use client';

import { useState, useEffect } from 'react';
import { X, Users, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency, shortenAddress, getIdenticonUrl, cn } from '@/lib/utils';

interface Holder {
  address: string;
  name: string;
  profileImage: string;
  amount: number;
  outcome: string;
}

interface HoldersModalProps {
  marketId: string;
  marketTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function HoldersModal({ marketId, marketTitle, isOpen, onClose }: HoldersModalProps) {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !marketId) return;

    async function fetchHolders() {
      setLoading(true);
      try {
        const res = await fetch(`/api/holders/${marketId}`);
        if (res.ok) {
          const data = await res.json();
          setHolders(data);
        }
      } catch (error) {
        console.error('Failed to fetch holders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHolders();
  }, [isOpen, marketId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Users className="text-purple-400" size={24} />
            <div>
              <h2 className="text-lg font-bold text-white">Top Holders</h2>
              <p className="text-sm text-white/60 line-clamp-1">{marketTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-pulse">
                  <div className="w-10 h-10 bg-white/10 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-24 mb-1" />
                    <div className="h-3 bg-white/10 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : holders.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              No holders data available
            </div>
          ) : (
            <div className="space-y-2">
              {holders.map((holder, index) => (
                <Link
                  key={`${holder.address}-${holder.outcome}`}
                  href={`/whale/${holder.address}`}
                  onClick={onClose}
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
                      <ExternalLink size={12} className="text-white/30 flex-shrink-0" />
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
          )}
        </div>
      </div>
    </div>
  );
}
