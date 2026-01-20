import { NextResponse } from 'next/server';
import { createClient } from 'redis';

const TRADE_PREFIX = 'trade:';

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

interface TradeData {
  id: string;
  question: string;
  betAmount: number;
  potentialPayout: number;
  outcome: string;
  traderName?: string;
  traderAddress: string;
  eventImage?: string;
  timestamp?: number;
}

// GET - Fetch trade by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const redis = await getRedisClient();
    const data = await redis.get(`${TRADE_PREFIX}${id}`);

    if (!data) {
      return NextResponse.json(
        { error: 'Trade not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Failed to fetch trade:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trade' },
      { status: 500 }
    );
  }
}

// POST - Save trade
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const trade: TradeData = await request.json();

    const redis = await getRedisClient();
    // Store for 30 days (2592000 seconds)
    await redis.set(`${TRADE_PREFIX}${id}`, JSON.stringify(trade), { EX: 2592000 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save trade:', error);
    return NextResponse.json(
      { error: 'Failed to save trade' },
      { status: 500 }
    );
  }
}
