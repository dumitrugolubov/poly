import { NextResponse } from 'next/server';

const GAMMA_API = 'https://gamma-api.polymarket.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';
  const sortBy = searchParams.get('sortBy') || 'volume24hr'; // volume24hr, volume, liquidity
  const category = searchParams.get('category') || '';

  try {
    // Fetch active markets sorted by volume
    let url = `${GAMMA_API}/markets?limit=${limit}&active=true&closed=false`;

    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Gamma API error: ${response.status}`);
    }

    const markets = await response.json();

    // Sort by specified field
    const sorted = markets
      .filter((m: { volumeNum: number }) => m.volumeNum > 0)
      .sort((a: Record<string, number>, b: Record<string, number>) => {
        const aVal = a[sortBy] || 0;
        const bVal = b[sortBy] || 0;
        return bVal - aVal;
      })
      .slice(0, parseInt(limit));

    // Transform to cleaner format
    const transformed = sorted.map((m: {
      id: string;
      question: string;
      slug: string;
      image: string;
      icon: string;
      category: string;
      volumeNum: number;
      volume24hr: number;
      liquidityNum: number;
      outcomePrices: string;
      outcomes: string;
      endDate: string;
      oneDayPriceChange: number;
    }) => {
      let prices: number[] = [0.5, 0.5];
      let outcomes: string[] = ['Yes', 'No'];

      try {
        prices = JSON.parse(m.outcomePrices).map((p: string) => parseFloat(p));
        outcomes = JSON.parse(m.outcomes);
      } catch {}

      return {
        id: m.id,
        question: m.question,
        slug: m.slug,
        image: m.image || m.icon,
        category: m.category,
        volume: m.volumeNum,
        volume24h: m.volume24hr,
        liquidity: m.liquidityNum,
        outcomes,
        prices,
        endDate: m.endDate,
        priceChange24h: m.oneDayPriceChange,
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
}
