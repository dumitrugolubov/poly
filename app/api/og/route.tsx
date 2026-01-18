import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const question = searchParams.get('question') || 'Whale Trade on Polymarket';
  const betAmount = parseFloat(searchParams.get('betAmount') || '50000');
  const potentialPayout = parseFloat(searchParams.get('potentialPayout') || '100000');
  const outcome = searchParams.get('outcome') || 'Yes';
  const traderName = searchParams.get('traderName') || '';
  const traderAddress = searchParams.get('traderAddress') || '';

  const isYes = outcome === 'Yes';
  const multiplier = betAmount > 0 ? (potentialPayout / betAmount).toFixed(2) : '2.00';

  // Shorten address
  const displayName = traderName || (traderAddress.length > 10
    ? `${traderAddress.slice(0, 6)}...${traderAddress.slice(-4)}`
    : 'Whale');

  // Format currency
  const formatAmount = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${value.toLocaleString()}`;
  };

  const betFormatted = formatAmount(betAmount);
  const payoutFormatted = formatAmount(potentialPayout);

  const outcomeColor = isYes ? '#4ade80' : '#f87171';
  const isHighROI = parseFloat(multiplier) > 2.5;
  const payoutColor = isHighROI ? '#facc15' : outcomeColor;

  // Truncate question
  const displayQuestion = question.length > 90 ? question.slice(0, 90) + '...' : question;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          padding: 48,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: '#4ade80' }}>POLY</span>
            <span style={{ fontSize: 42, fontWeight: 800, color: '#a855f7' }}>WAVE</span>
          </div>
          <span style={{ fontSize: 48 }}>🐋</span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            backgroundColor: 'rgba(30, 30, 30, 0.8)',
            borderRadius: 24,
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Left - 70% */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '70%',
              padding: 40,
              justifyContent: 'space-between',
            }}
          >
            {/* Trader */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  fontSize: 24,
                }}
              >
                🦈
              </div>
              <span style={{ fontSize: 22, fontWeight: 600, color: 'white' }}>{displayName}</span>
            </div>

            {/* Question */}
            <div style={{ fontSize: 34, fontWeight: 700, color: 'white', lineHeight: 1.3, flex: 1, display: 'flex', alignItems: 'center' }}>
              {displayQuestion}
            </div>

            {/* Outcome */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
              <div
                style={{
                  padding: '12px 28px',
                  borderRadius: 12,
                  backgroundColor: isYes ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                  color: outcomeColor,
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {outcome}
              </div>
            </div>
          </div>

          {/* Right - 30% */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '30%',
              padding: 40,
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              justifyContent: 'center',
            }}
          >
            {/* Bet */}
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 28, textAlign: 'right', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                Bet Amount
              </div>
              <div style={{ fontSize: 38, fontWeight: 700, color: 'white' }}>
                {betFormatted}
              </div>
            </div>

            {/* Payout */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 20, textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                Potential Payout
              </div>
              <div style={{ fontSize: 44, fontWeight: 900, color: payoutColor }}>
                {payoutFormatted}
              </div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
                {multiplier}x return
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>
            Track whale trades → polywave.trade
          </span>
          <div style={{ width: 180, height: 4, backgroundColor: '#4ade80', borderRadius: 2 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
