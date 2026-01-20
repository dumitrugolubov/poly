import { Metadata } from 'next';
import TradeRedirect from './TradeRedirect';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    question?: string;
    betAmount?: string;
    potentialPayout?: string;
    outcome?: string;
    traderName?: string;
    traderAddress?: string;
    eventImage?: string;
  }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;

  const question = query.question || 'Whale Trade on Polymarket';
  const betAmount = query.betAmount || '50000';
  const potentialPayout = query.potentialPayout || '100000';
  const outcome = query.outcome || 'Yes';
  const traderName = query.traderName || '';
  const traderAddress = query.traderAddress || '';
  const eventImage = query.eventImage || '';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.polywave.trade';

  // Build OG image URL with all parameters
  const ogParams = new URLSearchParams();
  ogParams.set('question', question);
  ogParams.set('betAmount', betAmount);
  ogParams.set('potentialPayout', potentialPayout);
  ogParams.set('outcome', outcome);
  if (traderName) ogParams.set('traderName', traderName);
  if (traderAddress) ogParams.set('traderAddress', traderAddress);
  if (eventImage) ogParams.set('eventImage', eventImage);

  const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

  // Format amounts for description
  const formatAmount = (val: string) => {
    const num = parseFloat(val);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${Math.round(num / 1000)}K`;
    return `$${num.toLocaleString()}`;
  };

  const multiplier = (parseFloat(potentialPayout) / parseFloat(betAmount)).toFixed(1);

  const title = `Whale Alert: ${formatAmount(betAmount)} bet on "${question.slice(0, 40)}${question.length > 40 ? '...' : ''}"`;
  const description = `${traderName || 'A whale trader'} placed a ${formatAmount(betAmount)} bet on "${outcome}" with a potential ${formatAmount(potentialPayout)} payout (${multiplier}x). Track more whale trades on Polywave!`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Whale trade: ${question}`,
        },
      ],
      type: 'website',
      siteName: 'Polywave - Whale Tracker',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@polywave',
    },
  };
}

export default async function TradePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  // Show the trade page with full card
  return (
    <TradeRedirect
      tradeId={id}
      question={query.question}
      betAmount={query.betAmount}
      potentialPayout={query.potentialPayout}
      outcome={query.outcome}
      traderName={query.traderName}
      traderAddress={query.traderAddress}
      eventImage={query.eventImage}
    />
  );
}
