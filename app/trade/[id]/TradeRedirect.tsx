'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface TradeRedirectProps {
  tradeId: string;
  question?: string;
  betAmount?: string;
  potentialPayout?: string;
  outcome?: string;
}

export default function TradeRedirect({
  tradeId,
  question,
  betAmount,
  potentialPayout,
  outcome,
}: TradeRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    // Build redirect URL with trade data
    const params = new URLSearchParams({ trade: tradeId });
    if (question) params.set('question', question);
    if (betAmount) params.set('betAmount', betAmount);
    if (potentialPayout) params.set('potentialPayout', potentialPayout);
    if (outcome) params.set('outcome', outcome);

    // Redirect to home page after a brief moment
    // This ensures the page with meta tags is fully served first
    router.replace(`/?${params.toString()}`);
  }, [tradeId, question, betAmount, potentialPayout, outcome, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      <p className="text-white/60">Loading trade...</p>
    </div>
  );
}
