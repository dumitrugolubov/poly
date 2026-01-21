import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com';

interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  image: string;
  icon: string;
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate: string;
  active: boolean;
  closed: boolean;
  markets?: {
    id: string;
    question: string;
    conditionId: string;
    slug: string;
    outcomePrices: string;
    outcomes: string;
    oneDayPriceChange: number;
  }[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '30');
  const sortBy = searchParams.get('sortBy') || 'volume24hr';

  try {
    // Fetch more events to get a good sample, then sort
    const response = await fetch(
      `${GAMMA_API}/events?limit=200&active=true&closed=false`,
      {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status}`);
    }

    const events: GammaEvent[] = await response.json();

    // Map sortBy param to event field
    const sortField = sortBy === 'volumeNum' ? 'volume'
      : sortBy === 'liquidityNum' ? 'liquidity'
      : 'volume24hr';

    // Sort by specified field and take top N
    const sorted = events
      .filter((e) => e.volume > 0)
      .sort((a, b) => {
        const aVal = (a[sortField as keyof GammaEvent] as number) || 0;
        const bVal = (b[sortField as keyof GammaEvent] as number) || 0;
        return bVal - aVal;
      })
      .slice(0, limit);

    // Transform to cleaner format
    const transformed = sorted.map((event) => {
      // Get the main market from the event (usually first one, or one with highest volume)
      const mainMarket = event.markets?.[0];

      let prices: number[] = [0.5, 0.5];
      let outcomes: string[] = ['Yes', 'No'];

      if (mainMarket) {
        try {
          prices = JSON.parse(mainMarket.outcomePrices).map((p: string) => parseFloat(p));
          outcomes = JSON.parse(mainMarket.outcomes);
        } catch {}
      }

      return {
        id: event.id,
        question: event.title,
        slug: event.slug,
        image: event.image || event.icon,
        category: 'Event',
        volume: event.volume,
        volume24h: event.volume24hr,
        liquidity: event.liquidity,
        outcomes,
        prices,
        endDate: event.endDate,
        priceChange24h: mainMarket?.oneDayPriceChange || 0,
        conditionId: mainMarket?.conditionId || '',
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
}
