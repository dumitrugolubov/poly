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
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get trade parameters
    const question = searchParams.get('question') || 'Whale Trade on Polymarket';
    const betAmount = parseFloat(searchParams.get('betAmount') || '50000');
    const potentialPayout = parseFloat(searchParams.get('potentialPayout') || '100000');
    const outcome = searchParams.get('outcome') || 'Yes';
    const traderName = searchParams.get('traderName') || '';
    const traderAddress = searchParams.get('traderAddress') || '';

    const isYes = outcome === 'Yes';
    const multiplier = (potentialPayout / betAmount).toFixed(2);

    // Determine payout color gradient
    const payoutGradient =
      parseFloat(multiplier) > 2.5
        ? 'linear-gradient(to right, #facc15, #fde68a, #fbbf24)' // Gold
        : isYes
          ? 'linear-gradient(to right, #4ade80, #a855f7)' // Green to purple
          : 'linear-gradient(to right, #f87171, #ec4899)'; // Red to pink

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #000000 0%, #0a1a0f 30%, #1a0f2e 70%, #0f0520 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '40px',
          }}
        >
          {/* Header with branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 800,
                  background: 'linear-gradient(to right, #4ade80, #a855f7)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                POLYWAVE
              </div>
              <div
                style={{
                  fontSize: '20px',
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 500,
                }}
              >
                Whale Tracker
              </div>
            </div>
            <div
              style={{
                fontSize: '48px',
              }}
            >
              🐋
            </div>
          </div>

          {/* Main card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Left side - Question & Trader */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '40px',
                justifyContent: 'space-between',
              }}
            >
              {/* Trader info */}
              {(traderName || traderAddress) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4ade80, #a855f7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    🦈
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#ffffff',
                      }}
                    >
                      {traderName || shortenAddress(traderAddress)}
                    </div>
                    {traderName && traderAddress && (
                      <div
                        style={{
                          fontSize: '14px',
                          color: 'rgba(255,255,255,0.5)',
                          fontFamily: 'monospace',
                        }}
                      >
                        {shortenAddress(traderAddress)}
                      </div>
                    )}
                  </div>
                </div>
              )}

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

              {/* Outcome badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '20px',
                }}
              >
                <div
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: isYes ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                    color: isYes ? '#4ade80' : '#f87171',
                    fontSize: '24px',
                    fontWeight: 700,
                  }}
                >
                  {outcome}
                </div>
                {parseFloat(multiplier) > 2 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      background: 'rgba(250, 204, 21, 0.15)',
                      color: '#facc15',
                      fontSize: '18px',
                      fontWeight: 600,
                    }}
                  >
                    📈 High ROI
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Financials */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '400px',
                padding: '40px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                justifyContent: 'center',
                alignItems: 'flex-end',
                textAlign: 'right',
              }}
            >
              {/* Bet Amount */}
              <div
                style={{
                  marginBottom: '30px',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                  }}
                >
                  Bet Amount
                </div>
                <div
                  style={{
                    fontSize: '42px',
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {formatCurrency(betAmount)}
                </div>
              </div>

              {/* Potential Payout */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px',
                  }}
                >
                  Potential Payout
                </div>
                <div
                  style={{
                    fontSize: '56px',
                    fontWeight: 900,
                    background: payoutGradient,
                    backgroundClip: 'text',
                    color: 'transparent',
                    lineHeight: 1,
                  }}
                >
                  {formatCurrency(potentialPayout)}
                </div>
                <div
                  style={{
                    fontSize: '18px',
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: '12px',
                  }}
                >
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
              marginTop: '20px',
              paddingTop: '20px',
            }}
          >
            <div
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.3)',
              }}
            >
              polywave.trade
            </div>
            <div
              style={{
                width: '200px',
                height: '4px',
                background: 'linear-gradient(to right, #4ade80, #a855f7)',
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error(`Error generating OG image: ${e}`);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
