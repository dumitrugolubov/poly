import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function shortenAddress(address: string): string {
  if (!address || address.length <= 10) return address || 'Whale';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

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
  const displayName = traderName || shortenAddress(traderAddress);

  // Color based on outcome
  const outcomeColor = isYes ? '#4ade80' : '#f87171';
  const outcomeBg = isYes ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)';

  // Payout gradient based on multiplier
  const isHighROI = parseFloat(multiplier) > 2.5;
  const payoutColor = isHighROI ? '#facc15' : (isYes ? '#4ade80' : '#f87171');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#000000',
          backgroundImage: 'linear-gradient(135deg, #000000 0%, #0a1a0f 30%, #1a0f2e 70%, #0f0520 100%)',
          padding: '48px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '40px', fontWeight: 800, color: '#4ade80' }}>POLY</span>
            <span style={{ fontSize: '40px', fontWeight: 800, color: '#a855f7' }}>WAVE</span>
            <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)', marginLeft: '16px' }}>Whale Tracker</span>
          </div>
          <span style={{ fontSize: '56px' }}>🐋</span>
        </div>

        {/* Main Card - 70/30 split */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {/* Left 70% - Content */}
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
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginRight: '16px',
                }}
              >
                🦈
              </div>
              <span style={{ fontSize: '24px', fontWeight: 600, color: '#ffffff' }}>{displayName}</span>
            </div>

            {/* Question */}
            <div
              style={{
                fontSize: '36px',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.3,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {question.length > 100 ? question.slice(0, 100) + '...' : question}
            </div>

            {/* Outcome Badge */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
              <div
                style={{
                  padding: '14px 32px',
                  borderRadius: '12px',
                  backgroundColor: outcomeBg,
                  color: outcomeColor,
                  fontSize: '32px',
                  fontWeight: 700,
                }}
              >
                {outcome}
              </div>
              {isHighROI ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 24px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(250, 204, 21, 0.15)',
                    color: '#facc15',
                    fontSize: '20px',
                    fontWeight: 600,
                    marginLeft: '16px',
                  }}
                >
                  📈 High ROI
                </div>
              ) : null}
            </div>
          </div>

          {/* Right 30% - Financials */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '30%',
              padding: '40px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {/* Bet Amount */}
            <div style={{ marginBottom: '32px', textAlign: 'right', width: '100%' }}>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                Bet Amount
              </div>
              <div style={{ fontSize: '44px', fontWeight: 700, color: '#ffffff' }}>
                {formatCurrency(betAmount)}
              </div>
            </div>

            {/* Payout */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                Potential Payout
              </div>
              <div style={{ fontSize: '48px', fontWeight: 900, color: payoutColor }}>
                {formatCurrency(potentialPayout)}
              </div>
              <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                {multiplier}x return
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '24px',
          }}
        >
          <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.5)' }}>
            Track whale trades → polywave.trade
          </span>
          <div style={{ width: '200px', height: '4px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
