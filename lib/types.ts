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
