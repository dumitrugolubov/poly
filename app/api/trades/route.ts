import { NextResponse } from 'next/server';

const DATA_API_BASE = 'https://data-api.polymarket.com';

// In-memory cache for whale trades
// Maps transaction hash -> trade data
const tradeCache = new Map<string, any>();

// Cache configuration
const CACHE_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_MIN_AMOUNT = 2500; // Increased from 1000 to 2500 for whale trades only

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '500';
  const minAmount = parseFloat(searchParams.get('minAmount') || DEFAULT_MIN_AMOUNT.toString());

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

    // DEBUG: Log first trade raw data to see actual API response
    if (trades.length > 0) {
      const firstTrade = trades[0];
      console.log('🔍 DEBUG First Raw Trade - ALL FIELDS:', JSON.stringify(firstTrade, null, 2).substring(0, 1000));
      console.log('🔍 DEBUG Calculation:', {
        size: firstTrade.size,
        price: firstTrade.price,
        usdcSize: firstTrade.usdcSize,
        'size * price': firstTrade.size * firstTrade.price,
        'usdcSize || (size * price)': firstTrade.usdcSize || (firstTrade.size * firstTrade.price),
      });
    }

    // Current timestamp for cache cleanup
    const now = Date.now();
    const cutoffTime = now - CACHE_RETENTION_MS;

    // Clean up old trades (older than 24 hours or below minimum amount)
    let removedCount = 0;
    for (const [hash, trade] of tradeCache.entries()) {
      const tradeTimestamp = trade.timestamp * 1000; // Convert to milliseconds
      const tradeAmount = trade.usdcSize || (trade.size * trade.price);

      // Remove if too old OR below current minimum amount
      if (tradeTimestamp < cutoffTime || tradeAmount < minAmount) {
        tradeCache.delete(hash);
        removedCount++;
      }
    }
    if (removedCount > 0) {
      console.log(`🧹 Removed ${removedCount} old/small trades (keeping only >= $${minAmount} from last 24h)`);
    }

    // Add new whale trades to cache (deduplicated by transaction hash)
    let newTradesCount = 0;
    for (const trade of trades) {
      // Skip if not a BUY order
      if (trade.side !== 'BUY') continue;

      // Calculate USDC amount
      const usdcAmount = trade.usdcSize || (trade.size * trade.price);

      // Skip if below minimum amount
      if (usdcAmount < minAmount) continue;

      // Use transaction hash as unique identifier
      const tradeHash = trade.transactionHash || `${trade.proxyWallet}-${trade.timestamp}`;

      // Add to cache if not already present
      if (!tradeCache.has(tradeHash)) {
        tradeCache.set(tradeHash, trade);
        newTradesCount++;
      }
    }

    console.log(`📊 Cache stats: ${newTradesCount} new trades added, ${tradeCache.size} total in cache`);

    // Get all cached trades, filter by minAmount, and sort by USDC amount
    const cachedTrades = Array.from(tradeCache.values());
    const sortedWhaleTrades = cachedTrades
      .filter((trade: { size: number; usdcSize?: number; price: number }) => {
        const tradeAmount = trade.usdcSize || (trade.size * trade.price);
        return tradeAmount >= minAmount;
      })
      .sort((a: { size: number; usdcSize?: number; price: number }, b: { size: number; usdcSize?: number; price: number }) => {
        const aAmount = a.usdcSize || (a.size * a.price);
        const bAmount = b.usdcSize || (b.size * b.price);
        return bAmount - aAmount;
      })
      .slice(0, 20);

    console.log(`✅ Returning ${sortedWhaleTrades.length} whale trades (>= $${minAmount})`);

    return NextResponse.json(sortedWhaleTrades, {
      headers: {
        // Minimal caching to ensure fresh data after deployments
        // Cache for 10 seconds max, then must revalidate
        'Cache-Control': 'public, max-age=10, must-revalidate',
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
