import { NextResponse } from 'next/server';

const DATA_API_BASE = 'https://data-api.polymarket.com';
const DEFAULT_MIN_AMOUNT = 500;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '500';
  const minAmount = parseFloat(searchParams.get('minAmount') || DEFAULT_MIN_AMOUNT.toString());

  try {
    // Fetch fresh trades from Polymarket API
    const response = await fetch(`${DATA_API_BASE}/trades?limit=${limit}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polywave/1.0',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`Polymarket API error: ${response.status} ${response.statusText}`);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const trades = await response.json();
    console.log(`Fetched ${trades.length} trades from Polymarket`);

    // Filter and process trades
    const whaleTrades = trades
      .filter((trade: { side: string; size: number; usdcSize?: number; price: number }) => {
        // Only BUY orders
        if (trade.side !== 'BUY') return false;

        // Calculate USDC amount (what was actually spent)
        const usdcAmount = trade.usdcSize || (trade.size * trade.price);

        // Filter by minimum amount
        return usdcAmount >= minAmount;
      })
      .sort((a: { size: number; usdcSize?: number; price: number }, b: { size: number; usdcSize?: number; price: number }) => {
        // Sort by USDC amount descending (biggest bets first)
        const aAmount = a.usdcSize || (a.size * a.price);
        const bAmount = b.usdcSize || (b.size * b.price);
        return bAmount - aAmount;
      })
      .slice(0, 20); // Top 20 whale trades

    console.log(`Returning ${whaleTrades.length} whale trades (>= $${minAmount})`);

    return NextResponse.json(whaleTrades, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
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
