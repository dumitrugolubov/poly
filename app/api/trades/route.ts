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
      },
      // Revalidate every 30 seconds
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const trades = await response.json();

    // Filter for whale trades (large amounts) and BUY orders only
    // Sort by size descending to show biggest trades first
    const whaleTrades = trades
      .filter((trade: { size: number; side: string }) =>
        trade.size >= minAmount && trade.side === 'BUY'
      )
      .sort((a: { size: number }, b: { size: number }) => b.size - a.size)
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
