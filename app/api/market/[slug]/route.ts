import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com';
const DATA_API = 'https://data-api.polymarket.com';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    // Fetch market by slug
    const response = await fetch(`${GAMMA_API}/markets?slug=${slug}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status}`);
    }

    const markets = await response.json();
    const market = markets[0];

    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    // Parse prices and outcomes
    let prices: number[] = [0.5, 0.5];
    let outcomes: string[] = ['Yes', 'No'];

    try {
      prices = JSON.parse(market.outcomePrices).map((p: string) => parseFloat(p));
      outcomes = JSON.parse(market.outcomes);
    } catch {}

    // Fetch top holders if we have conditionId
    let holders: {
      address: string;
      name: string;
      profileImage: string;
      amount: number;
      outcome: string;
    }[] = [];

    if (market.conditionId) {
      try {
        const holdersRes = await fetch(
          `${DATA_API}/holders?market=${market.conditionId}&limit=10`,
          { cache: 'no-store' }
        );
        if (holdersRes.ok) {
          const holdersData = await holdersRes.json();
          for (const tokenGroup of holdersData) {
            const outcomeIndex = tokenGroup.holders?.[0]?.outcomeIndex ?? 0;
            const outcome = outcomeIndex === 0 ? 'Yes' : 'No';
            for (const holder of tokenGroup.holders || []) {
              holders.push({
                address: holder.proxyWallet,
                name: holder.name || holder.pseudonym || '',
                profileImage: holder.profileImageOptimized || holder.profileImage || '',
                amount: holder.amount,
                outcome,
              });
            }
          }
          holders.sort((a, b) => b.amount - a.amount);
          holders = holders.slice(0, 20);
        }
      } catch {}
    }

    return NextResponse.json({
      id: market.id,
      conditionId: market.conditionId,
      question: market.question,
      description: market.description || '',
      slug: market.slug,
      image: market.image || market.icon,
      category: market.category || 'General',
      outcomes,
      prices,
      volume: market.volumeNum || 0,
      volume24h: market.volume24hr || 0,
      liquidity: market.liquidityNum || 0,
      endDate: market.endDate,
      active: market.active,
      closed: market.closed,
      priceChange24h: market.oneDayPriceChange || 0,
      bestBid: market.bestBid || 0,
      bestAsk: market.bestAsk || 0,
      holders,
    });
  } catch (error) {
    console.error('Failed to fetch market:', error);
    return NextResponse.json({ error: 'Failed to fetch market' }, { status: 500 });
  }
}
