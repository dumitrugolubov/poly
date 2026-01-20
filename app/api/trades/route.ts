import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const DATA_API_BASE = 'https://data-api.polymarket.com';
const DEFAULT_MIN_AMOUNT = 2500;
const MAX_STORED_TRADES = 100;
const REDIS_KEY = 'whale_trades';

interface StoredTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: number;
  usdcSize?: number;
  price: number;
  timestamp: number;
  title: string;
  slug: string;
  icon: string;
  eventSlug: string;
  outcome: string;
  outcomeIndex: number;
  name: string;
  pseudonym: string;
  bio: string;
  profileImage: string;
  profileImageOptimized: string;
  transactionHash: string;
}

// Create Redis client (lazy connection)
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error('REDIS_URL not configured');
    }
    redisClient = createClient({ url });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }
  return redisClient;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '500';
  const minAmount = parseFloat(searchParams.get('minAmount') || DEFAULT_MIN_AMOUNT.toString());

  try {
    // 1. Fetch new trades from Polymarket API
    const response = await fetch(`${DATA_API_BASE}/trades?limit=${limit}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Polywave/1.0',
      },
      cache: 'no-store',
    });

    let newWhaleTrades: StoredTrade[] = [];

    if (response.ok) {
      const trades = await response.json();
      console.log(`Fetched ${trades.length} trades from Polymarket`);

      // Filter for whale trades
      newWhaleTrades = trades.filter((trade: StoredTrade) => {
        if (trade.side !== 'BUY') return false;
        const usdcAmount = trade.usdcSize || (trade.size * trade.price);
        return usdcAmount >= minAmount;
      });

      console.log(`Found ${newWhaleTrades.length} new whale trades (>= $${minAmount})`);
    } else {
      console.error(`Polymarket API error: ${response.status} ${response.statusText}`);
    }

    // 2. Get existing accumulated trades from Redis
    let storedTrades: StoredTrade[] = [];
    try {
      const redis = await getRedisClient();
      const data = await redis.get(REDIS_KEY);
      if (data) {
        storedTrades = JSON.parse(data);
      }
      console.log(`Retrieved ${storedTrades.length} stored trades from Redis`);
    } catch (redisError) {
      console.error('Redis read error (continuing with empty):', redisError);
    }

    // 3. Merge new trades with stored trades (dedupe by transactionHash)
    const tradeMap = new Map<string, StoredTrade>();

    // Add stored trades first
    for (const trade of storedTrades) {
      const key = trade.transactionHash || `${trade.proxyWallet}-${trade.timestamp}`;
      tradeMap.set(key, trade);
    }

    // Add new trades (will overwrite if duplicate)
    for (const trade of newWhaleTrades) {
      const key = trade.transactionHash || `${trade.proxyWallet}-${trade.timestamp}`;
      tradeMap.set(key, trade);
    }

    // 4. Convert back to array and sort by timestamp (newest first)
    const allTrades = Array.from(tradeMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_STORED_TRADES);

    // 5. Store back to Redis (only if we have new trades to add)
    if (newWhaleTrades.length > 0) {
      try {
        const redis = await getRedisClient();
        await redis.set(REDIS_KEY, JSON.stringify(allTrades));
        console.log(`Stored ${allTrades.length} trades to Redis`);
      } catch (redisError) {
        console.error('Redis write error:', redisError);
      }
    }

    console.log(`Returning ${allTrades.length} total whale trades`);

    return NextResponse.json(allTrades, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to fetch trades:', error);

    // On error, try to return stored trades if available
    try {
      const redis = await getRedisClient();
      const data = await redis.get(REDIS_KEY);
      if (data) {
        const storedTrades = JSON.parse(data);
        console.log(`Returning ${storedTrades.length} stored trades (fallback)`);
        return NextResponse.json(storedTrades, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }
    } catch {
      // Redis also failed
    }

    return NextResponse.json(
      { error: 'Failed to fetch trades' },
      { status: 500 }
    );
  }
}
