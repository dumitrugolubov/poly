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

  const displayName = traderName || (traderAddress.length > 10
    ? `${traderAddress.slice(0, 6)}...${traderAddress.slice(-4)}`
    : 'Whale');

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
  const displayQuestion = question.length > 90 ? question.slice(0, 90) + '...' : question;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          padding: 48,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: '#4ade80' }}>POLY</span>
            <span style={{ fontSize: 42, fontWeight: 800, color: '#a855f7' }}>WAVE</span>
          </div>
          <span style={{ fontSize: 48 }}>🐋</span>
        </div>

        {/* Main Card */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            backgroundColor: '#1e1e1e',
            borderRadius: 24,
            overflow: 'hidden',
          }}
        >
          {/* Left Side - 70% */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '70%',
              padding: 40,
            }}
          >
            {/* Trader */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: '#a855f7',
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
            <div
              style={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                fontSize: 34,
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.3,
              }}
            >
              {displayQuestion}
            </div>

            {/* Outcome */}
            <div style={{ display: 'flex', marginTop: 20 }}>
              <div
                style={{
                  display: 'flex',
                  padding: '12px 28px',
                  borderRadius: 12,
                  backgroundColor: isYes ? '#22543d' : '#742a2a',
                  color: outcomeColor,
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {outcome}
              </div>
            </div>
          </div>

          {/* Right Side - 30% */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '30%',
              padding: 40,
              borderLeft: '1px solid #333333',
              justifyContent: 'center',
            }}
          >
            {/* Bet Amount */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 28 }}>
              <span style={{ fontSize: 13, color: '#888888', marginBottom: 6 }}>BET AMOUNT</span>
              <span style={{ fontSize: 38, fontWeight: 700, color: 'white' }}>{betFormatted}</span>
            </div>

            {/* Payout */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                backgroundColor: '#262626',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <span style={{ fontSize: 11, color: '#999999', marginBottom: 6 }}>POTENTIAL PAYOUT</span>
              <span style={{ fontSize: 44, fontWeight: 900, color: payoutColor }}>{payoutFormatted}</span>
              <span style={{ fontSize: 16, color: '#666666', marginTop: 8 }}>{multiplier}x return</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 20,
          }}
        >
          <span style={{ fontSize: 18, color: '#666666' }}>Track whale trades → polywave.trade</span>
          <div style={{ display: 'flex', width: 180, height: 4, backgroundColor: '#4ade80', borderRadius: 2 }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
