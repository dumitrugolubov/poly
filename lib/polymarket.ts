import { WhaleTrade } from './types';

// Set to true to use real API, false for mock data
const USE_REAL_API = true;

// Interface for raw trade data from Polymarket API
interface PolymarketTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: number; // Number of shares
  usdcSize?: number; // Amount in USDC (if provided by API)
  price: number; // Price per share (0-1)
  timestamp: number; // Unix timestamp in seconds
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

/**
 * Fetch whale trades from Polymarket Data API via our proxy
 * @param minAmount Minimum trade amount in USDC to be considered a whale trade (default: $2500)
 * @returns Array of whale trades
 */
export async function fetchWhaleTrades(minAmount: number = 2500): Promise<WhaleTrade[]> {
  if (!USE_REAL_API) {
    console.log('📊 Using mock whale trades data (USE_REAL_API=false)');
    return getMockWhaleTrades();
  }

  try {
    console.log('🔍 Fetching real whale trades from Polymarket API...');

    // Use our own API route to proxy requests (avoids CORS issues)
    const response = await fetch(`/api/trades?limit=500&minAmount=${minAmount}`, {
      cache: 'no-store', // Always get fresh data
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const trades: PolymarketTrade[] = await response.json();

    // Check if we got an error response
    if ('error' in trades) {
      throw new Error('API returned an error');
    }

    console.log(`✅ Found ${trades.length} whale trades (>= $${minAmount})`);

    // Transform to our WhaleTrade format
    const enrichedTrades: WhaleTrade[] = trades.map((trade) => {
      // Calculate bet amount and shares correctly
      // size = number of shares purchased
      // usdcSize = amount spent in USDC (if provided by API)
      // price = price per share (0-1)

      const shares = trade.size; // size is the number of shares
      const betAmount = trade.usdcSize || (trade.size * trade.price); // Use usdcSize if available, otherwise calculate

      // Calculate potential payout based on shares
      // Each winning share is worth $1
      // Example: 2500 shares × $1.00 = $2500 potential payout
      const potentialPayout = shares; // Each winning share is worth $1

      // Normalize outcome to Yes/No
      let outcome: 'Yes' | 'No' = 'Yes';
      const normalizedOutcome = trade.outcome.toLowerCase();
      if (normalizedOutcome === 'no' || normalizedOutcome === 'down' || normalizedOutcome.includes('no')) {
        outcome = 'No';
      }

      return {
        id: trade.transactionHash || `${trade.proxyWallet}-${trade.timestamp}`,
        question: trade.title,
        betAmount: betAmount,
        outcome,
        potentialPayout: Math.round(potentialPayout * 100) / 100,
        traderAddress: trade.proxyWallet,
        timestamp: trade.timestamp,
        marketId: trade.conditionId,
        // Trader info
        traderName: trade.name || trade.pseudonym || undefined,
        traderProfileImage: trade.profileImageOptimized || trade.profileImage || undefined,
        traderBio: trade.bio || undefined,
        // Event info
        eventImage: trade.icon || undefined,
        marketTitle: trade.title,
        marketSlug: trade.slug || undefined,
        eventSlug: trade.eventSlug || undefined,
      };
    });

    // If no whale trades found, return mock data
    if (enrichedTrades.length === 0) {
      console.log('⚠️ No whale trades found, using mock data');
      return getMockWhaleTrades();
    }

    return enrichedTrades;
  } catch (error) {
    console.warn('⚠️ Failed to fetch from Polymarket API, using mock data:', error instanceof Error ? error.message : 'Unknown error');
    return getMockWhaleTrades();
  }
}

// Mock data fallback
function getMockWhaleTrades(): WhaleTrade[] {
  const now = Math.floor(Date.now() / 1000);

  return [
    {
      id: 'mock-btc-100k',
      question: 'Will Bitcoin reach $100,000 by end of 2026?',
      betAmount: 25000,
      outcome: 'Yes',
      potentialPayout: 45000,
      traderAddress: '0x1234567890abcdef1234567890abcdef12345678',
      timestamp: now - 180,
      marketId: 'market-btc',
      traderName: 'CryptoWhale',
      eventImage: 'https://polymarket-upload.s3.us-east-2.amazonaws.com/BTC+fullsize.png',
    },
    {
      id: 'mock-ai-5t',
      question: 'Will a major AI company be valued over $5 trillion in 2026?',
      betAmount: 18500,
      outcome: 'Yes',
      potentialPayout: 33300,
      traderAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      timestamp: now - 620,
      marketId: 'market-ai',
      traderName: 'AI Believer',
    },
    {
      id: 'mock-fed-rates',
      question: 'Will the Fed cut interest rates by 50+ basis points this year?',
      betAmount: 12000,
      outcome: 'No',
      potentialPayout: 26400,
      traderAddress: '0x9876543210fedcba9876543210fedcba98765432',
      timestamp: now - 1450,
      marketId: 'market-fed',
    },
    {
      id: 'mock-eth-10k',
      question: 'Will Ethereum surpass $10,000 in 2026?',
      betAmount: 32000,
      outcome: 'Yes',
      potentialPayout: 57600,
      traderAddress: '0x5555666677778888999900001111222233334444',
      timestamp: now - 2100,
      marketId: 'market-eth',
      traderName: 'ETH Maxi',
      traderProfileImage: 'https://i.pravatar.cc/150?img=33',
    },
    {
      id: 'mock-new-crypto',
      question: 'Will a new cryptocurrency enter the top 5 by market cap in 2026?',
      betAmount: 9800,
      outcome: 'No',
      potentialPayout: 21560,
      traderAddress: '0xdeadbeefcafebabe1234567890abcdef00112233',
      timestamp: now - 3780,
      marketId: 'market-crypto',
    },
    {
      id: 'mock-tesla-500',
      question: 'Will Tesla stock reach $500 by Q4 2026?',
      betAmount: 15700,
      outcome: 'Yes',
      potentialPayout: 28260,
      traderAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
      timestamp: now - 5240,
      marketId: 'market-tesla',
      traderName: 'Tesla Bull',
    },
  ];
}
