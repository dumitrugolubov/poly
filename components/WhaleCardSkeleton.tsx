export default function WhaleCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 animate-pulse">
      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6">
        {/* Left column skeleton */}
        <div className="md:w-[70%] flex flex-col gap-4">
          {/* Trader info skeleton */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10" />
            <div className="flex flex-col gap-2">
              <div className="w-32 h-4 rounded bg-white/10" />
              <div className="w-24 h-3 rounded bg-white/5" />
            </div>
          </div>

          {/* Question skeleton */}
          <div className="flex-1 py-4">
            <div className="w-full h-6 rounded bg-white/10 mb-2" />
            <div className="w-3/4 h-6 rounded bg-white/10" />
          </div>

          {/* Outcome badge skeleton */}
          <div className="w-20 h-10 rounded-xl bg-white/10" />
        </div>

        {/* Right column skeleton */}
        <div className="md:w-[30%] flex flex-col justify-center items-end gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-4">
          {/* Bet amount skeleton */}
          <div className="flex flex-col items-end gap-2">
            <div className="w-20 h-3 rounded bg-white/5" />
            <div className="w-28 h-8 rounded bg-white/10" />
          </div>

          {/* Payout skeleton */}
          <div className="w-full bg-white/5 rounded-lg p-4">
            <div className="flex flex-col items-end gap-2">
              <div className="w-24 h-3 rounded bg-white/5" />
              <div className="w-32 h-10 rounded bg-white/10" />
              <div className="w-16 h-3 rounded bg-white/5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
