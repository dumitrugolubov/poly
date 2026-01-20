import { Metadata } from 'next';
import { createClient } from 'redis';
import TradeRedirect from './TradeRedirect';

interface TradeData {
  id: string;
  question: string;
  betAmount: number;
  potentialPayout: number;
  outcome: string;
  traderName?: string;
  traderAddress: string;
  eventImage?: string;
  timestamp?: number;
}

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

const TRADE_PREFIX = 'trade:';

async function getTradeFromRedis(id: string): Promise<TradeData | null> {
  try {
    const url = process.env.REDIS_URL;
    if (!url) return null;

    const redis = createClient({ url });
    await redis.connect();
    const data = await redis.get(`${TRADE_PREFIX}${id}`);
    await redis.disconnect();

    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to fetch trade from Redis:', error);
  }
  return null;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;

  // Try to get trade from Redis first
  const redisTrade = await getTradeFromRedis(id);

  // Use Redis data or fall back to query params
  const question = redisTrade?.question || query.question || 'Whale Trade on Polymarket';
  const betAmount = redisTrade?.betAmount?.toString() || query.betAmount || '50000';
  const potentialPayout = redisTrade?.potentialPayout?.toString() || query.potentialPayout || '100000';
  const outcome = redisTrade?.outcome || query.outcome || 'Yes';
  const traderName = redisTrade?.traderName || query.traderName || '';
  const traderAddress = redisTrade?.traderAddress || query.traderAddress || '';
  const eventImage = redisTrade?.eventImage || query.eventImage || '';

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

  // Format amounts for description (with safety checks)
  const formatAmount = (val: string) => {
    const num = parseFloat(val);
    if (!isFinite(num) || num <= 0) return '$0';
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${Math.round(num / 1000)}K`;
    return `$${num.toLocaleString()}`;
  };

  // Safe multiplier calculation (avoid division by zero)
  const betAmountNum = parseFloat(betAmount);
  const payoutNum = parseFloat(potentialPayout);
  const multiplier = (betAmountNum > 0 && isFinite(betAmountNum) && isFinite(payoutNum))
    ? (payoutNum / betAmountNum).toFixed(1)
    : '0.0';

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

  // Try to get trade from Redis first
  const redisTrade = await getTradeFromRedis(id);

  // Show the trade page with full card
  return (
    <TradeRedirect
      tradeId={id}
      question={redisTrade?.question || query.question}
      betAmount={redisTrade?.betAmount?.toString() || query.betAmount}
      potentialPayout={redisTrade?.potentialPayout?.toString() || query.potentialPayout}
      outcome={redisTrade?.outcome || query.outcome}
      traderName={redisTrade?.traderName || query.traderName}
      traderAddress={redisTrade?.traderAddress || query.traderAddress}
      eventImage={redisTrade?.eventImage || query.eventImage}
    />
  );
}
