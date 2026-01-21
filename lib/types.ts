export interface WhaleTrade {
  id: string;
  question: string;
  betAmount: number;
  outcome: 'Yes' | 'No';
  potentialPayout: number;
  traderAddress: string;
  timestamp: number;
  marketId: string;
  // Rich metadata from Gamma API
  traderName?: string;
  traderProfileImage?: string;
  traderTwitterHandle?: string;
  traderBio?: string;
  eventImage?: string;
  marketTitle?: string; // Cleaner title from Gamma API
  marketSlug?: string; // For Polymarket URL
  eventSlug?: string; // For event URL
}

export interface PolymarketBet {
  id: string;
  amount: string;
  outcomeIndex: string;
  trader: {
    id: string;
  };
  market: {
    id: string;
    question: string;
    outcomes: string[];
  };
  timestamp: string;
}

// Market from Gamma API
export interface Market {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string;
  outcomePrices: string;
  volume: string;
  volumeNum: number;
  liquidity: string;
  liquidityNum: number;
  active: boolean;
  closed: boolean;
  category: string;
  endDate: string;
  volume24hr: number;
  volume1wk: number;
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  oneDayPriceChange: number;
}

// Whale/Trader profile
export interface WhaleProfile {
  address: string;
  name?: string;
  profileImage?: string;
  bio?: string;
  totalValue: number;
  positions: Position[];
  recentActivity: Activity[];
  stats: {
    totalTrades: number;
    winRate: number;
    avgBetSize: number;
    totalVolume: number;
    pnl: number;
  };
}

// Position
export interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  marketSlug?: string;
  marketImage?: string;
  outcome: string;
  size: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

// Activity
export interface Activity {
  id: string;
  type: 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD';
  timestamp: number;
  marketTitle: string;
  marketSlug?: string;
  outcome?: string;
  side?: 'BUY' | 'SELL';
  size: number;
  price?: number;
  usdAmount: number;
  transactionHash: string;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  address: string;
  name?: string;
  profileImage?: string;
  totalVolume: number;
  totalPnl: number;
  winRate: number;
  tradesCount: number;
}

// Top holder
export interface TopHolder {
  address: string;
  name?: string;
  profileImage?: string;
  position: number;
  outcome: string;
  value: number;
}
