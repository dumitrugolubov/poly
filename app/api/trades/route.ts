import { NextResponse } from 'next/server';

const DATA_API_BASE = 'https://data-api.polymarket.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '500';
  const minAmount = parseFloat(searchParams.get('minAmount') || '1000');

  try {
    const response = await fetch(`${DATA_API_BASE}/trades?limit=${limit}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polywave/1.0',
      },
      cache: 'no-store', // Don't cache to always get fresh data
    });

    if (!response.ok) {
      console.error(`Polymarket API error: ${response.status} ${response.statusText}`);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const trades = await response.json();
    console.log(`Fetched ${trades.length} trades from Polymarket`);

    // Filter for whale trades (large amounts) and BUY orders only
    // Note: size = number of shares, usdcSize = amount in USDC
    // Sort by USDC amount descending to show biggest trades first
    const whaleTrades = trades
      .filter((trade: { size: number; usdcSize?: number; price: number; side: string }) => {
        const usdcAmount = trade.usdcSize || (trade.size * trade.price);
        return usdcAmount >= minAmount && trade.side === 'BUY';
      })
      .sort((a: { size: number; usdcSize?: number; price: number }, b: { size: number; usdcSize?: number; price: number }) => {
        const aAmount = a.usdcSize || (a.size * a.price);
        const bAmount = b.usdcSize || (b.size * b.price);
        return bAmount - aAmount;
      })
      .slice(0, 20);

    return NextResponse.json(whaleTrades, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Failed to fetch trades:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}
