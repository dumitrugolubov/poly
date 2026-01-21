'use client';

import { useTrades } from '@/hooks/useTrades';
import { useDownload } from '@/hooks/useDownload';
import WhaleCard from './WhaleCard';
import WhaleCardSkeleton from './WhaleCardSkeleton';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

export default function Feed() {
  const { trades, loading, error, refresh, lastUpdated } = useTrades();
  const { downloadTradeImage } = useDownload();

  // Loading state with skeletons
  if (loading && trades.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => (
            <WhaleCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && trades.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load trades</h2>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && trades.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-16 h-16 text-white/30 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No whale trades found</h2>
            <p className="text-white/60 mb-6">
              No trades over $5,000 in the last batch. Check back soon!
            </p>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Last updated indicator */}
        {lastUpdated && (
          <div className="flex items-center justify-end gap-2 mb-4 text-sm text-white/40">
            <span>Updated {formatTimestamp(Math.floor(lastUpdated.getTime() / 1000))}</span>
            <button
              onClick={refresh}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              title="Refresh now"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}

        {/* Error banner (when we have cached data but refresh failed) */}
        {error && trades.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="text-red-200 text-sm">Failed to refresh. Showing cached data.</span>
            <button
              onClick={refresh}
              className="ml-auto text-red-300 hover:text-red-100 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Trade cards */}
        <div className="space-y-6">
          {trades.map((trade) => (
            <WhaleCard key={trade.id} trade={trade} onDownload={downloadTradeImage} />
          ))}
        </div>
      </div>
    </div>
  );
}
