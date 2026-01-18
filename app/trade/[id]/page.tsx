import { Metadata } from 'next';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    question?: string;
    betAmount?: string;
    potentialPayout?: string;
    outcome?: string;
    traderName?: string;
    traderAddress?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;

  const question = params.question || 'Whale Trade on Polymarket';
  const betAmount = params.betAmount || '50000';
  const potentialPayout = params.potentialPayout || '100000';
  const outcome = params.outcome || 'Yes';
  const traderName = params.traderName || '';
  const traderAddress = params.traderAddress || '';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://polywave.trade';

  // Build OG image URL with all parameters
  const ogParams = new URLSearchParams({
    question,
    betAmount,
    potentialPayout,
    outcome,
    traderName,
    traderAddress,
  });

  const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;

  // Format amounts for description
  const formatAmount = (val: string) => {
    const num = parseFloat(val);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${Math.round(num / 1000)}K`;
    return `$${num.toLocaleString()}`;
  };

  const title = `🐋 ${formatAmount(betAmount)} Whale Bet on "${question.slice(0, 50)}${question.length > 50 ? '...' : ''}"`;
  const description = `${traderName || 'A whale'} bet ${formatAmount(betAmount)} on ${outcome} with potential payout of ${formatAmount(potentialPayout)}. Track whale trades on Polywave.`;

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
      siteName: 'Polywave',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function TradePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;

  // Build redirect URL back to home with trade highlighted
  const redirectParams = new URLSearchParams({ trade: id });

  // Pass through all the trade data for potential use
  if (query.question) redirectParams.set('question', query.question);
  if (query.betAmount) redirectParams.set('betAmount', query.betAmount);
  if (query.potentialPayout) redirectParams.set('potentialPayout', query.potentialPayout);
  if (query.outcome) redirectParams.set('outcome', query.outcome);

  // Redirect to home page - the meta tags will still work for social previews
  redirect(`/?${redirectParams.toString()}`);
}
