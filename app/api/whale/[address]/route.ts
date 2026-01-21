import { NextResponse } from 'next/server';

const DATA_API = 'https://data-api.polymarket.com';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    // Fetch positions, activity, and value in parallel
    const [positionsRes, activityRes, valueRes] = await Promise.all([
      fetch(`${DATA_API}/positions?user=${address}&limit=50&sortBy=CURRENT&sortDirection=DESC`, {
        cache: 'no-store',
      }),
      fetch(`${DATA_API}/activity?user=${address}&limit=50`, {
        cache: 'no-store',
      }),
      fetch(`${DATA_API}/value?user=${address}`, {
        cache: 'no-store',
      }),
    ]);

    const positions = positionsRes.ok ? await positionsRes.json() : [];
    const activity = activityRes.ok ? await activityRes.json() : [];
    const valueData = valueRes.ok ? await valueRes.json() : { value: 0 };

    // Get trader info from first position/activity if available
    let traderName = '';
    let traderImage = '';

    if (positions.length > 0 && positions[0].name) {
      traderName = positions[0].name;
      traderImage = positions[0].profileImage || '';
    }

    // Calculate stats from activity
    const trades = activity.filter((a: { type: string }) => a.type === 'TRADE');
    const buyTrades = trades.filter((t: { side: string }) => t.side === 'BUY');
    const totalVolume = trades.reduce((sum: number, t: { cashAmount?: number; usdcSize?: number }) =>
      sum + (t.cashAmount || t.usdcSize || 0), 0);
    const avgBetSize = trades.length > 0 ? totalVolume / trades.length : 0;

    // Calculate PnL from positions
    const totalPnl = positions.reduce((sum: number, p: { cashPnl?: number }) =>
      sum + (p.cashPnl || 0), 0);

    // Transform positions
    const transformedPositions = positions.map((p: {
      oddsId?: string;
      conditionId: string;
      title: string;
      slug: string;
      icon: string;
      outcome: string;
      curPosition: number;
      initialPrice: number;
      curPrice: number;
      currentValue: number;
      cashPnl: number;
      percentPnl: number;
    }, index: number) => ({
      id: p.oddsId || `${p.conditionId}-${index}`,
      marketId: p.conditionId,
      marketTitle: p.title,
      marketSlug: p.slug,
      marketImage: p.icon,
      outcome: p.outcome,
      size: p.curPosition || 0,
      avgPrice: p.initialPrice || 0,
      currentPrice: p.curPrice || 0,
      value: p.currentValue || 0,
      pnl: p.cashPnl || 0,
      pnlPercent: p.percentPnl || 0,
    }));

    // Transform activity
    const transformedActivity = activity.slice(0, 20).map((a: {
      oddsId?: string;
      type: string;
      timestamp: number;
      title?: string;
      slug?: string;
      outcome?: string;
      side?: string;
      size?: number;
      price?: number;
      cashAmount?: number;
      usdcSize?: number;
      transactionHash?: string;
    }, index: number) => ({
      id: a.oddsId || a.transactionHash || `activity-${index}`,
      type: a.type || 'TRADE',
      timestamp: a.timestamp || 0,
      marketTitle: a.title || 'Unknown Market',
      marketSlug: a.slug || '',
      outcome: a.outcome || '',
      side: a.side || 'BUY',
      size: a.size || 0,
      price: a.price || 0,
      usdAmount: a.cashAmount || a.usdcSize || 0,
      transactionHash: a.transactionHash || '',
    }));

    return NextResponse.json({
      address,
      name: traderName,
      profileImage: traderImage,
      totalValue: valueData.value || 0,
      positions: transformedPositions,
      recentActivity: transformedActivity,
      stats: {
        totalTrades: trades.length,
        winRate: 0, // Would need historical resolved data
        avgBetSize: Math.round(avgBetSize),
        totalVolume: Math.round(totalVolume),
        pnl: Math.round(totalPnl * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Failed to fetch whale profile:', error);
    return NextResponse.json({ error: 'Failed to fetch whale profile' }, { status: 500 });
  }
}
