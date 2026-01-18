import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
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
            padding: '48px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '42px', fontWeight: 800, color: '#4ade80' }}>POLY</span>
              <span style={{ fontSize: '42px', fontWeight: 800, color: '#a855f7' }}>WAVE</span>
            </div>
            <span style={{ fontSize: '48px' }}>🐋</span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexGrow: 1,
              backgroundColor: '#1e1e1e',
              borderRadius: '24px',
              border: '1px solid #333333',
            }}
          >
            {/* Left - 70% */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '70%',
                padding: '40px',
                justifyContent: 'space-between',
              }}
            >
              {/* Trader */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '26px',
                    backgroundColor: '#a855f7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    fontSize: '24px',
                  }}
                >
                  🦈
                </div>
                <span style={{ fontSize: '22px', fontWeight: 600, color: 'white' }}>{displayName}</span>
              </div>

              {/* Question */}
              <div style={{ fontSize: '34px', fontWeight: 700, color: 'white', lineHeight: 1.3, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {displayQuestion}
              </div>

              {/* Outcome */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <div
                  style={{
                    padding: '12px 28px',
                    borderRadius: '12px',
                    backgroundColor: isYes ? '#22543d' : '#742a2a',
                    color: outcomeColor,
                    fontSize: '28px',
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
                padding: '40px',
                borderLeft: '1px solid #333333',
                justifyContent: 'center',
              }}
            >
              {/* Bet */}
              <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '28px', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '13px', color: '#888888', marginBottom: '6px' }}>
                  BET AMOUNT
                </div>
                <div style={{ fontSize: '38px', fontWeight: 700, color: 'white' }}>
                  {betFormatted}
                </div>
              </div>

              {/* Payout */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', backgroundColor: '#262626', borderRadius: '14px', padding: '20px' }}>
                <div style={{ fontSize: '11px', color: '#999999', marginBottom: '6px' }}>
                  POTENTIAL PAYOUT
                </div>
                <div style={{ fontSize: '44px', fontWeight: 900, color: payoutColor }}>
                  {payoutFormatted}
                </div>
                <div style={{ fontSize: '16px', color: '#666666', marginTop: '8px' }}>
                  {multiplier}x return
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '18px', color: '#666666' }}>
              Track whale trades → polywave.trade
            </span>
            <div style={{ width: '180px', height: '4px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response(`Error generating image: ${error}`, { status: 500 });
  }
}
