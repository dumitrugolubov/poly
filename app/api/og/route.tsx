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
  const eventImage = searchParams.get('eventImage') || '';

  const isYes = outcome === 'Yes';
  const multiplier = betAmount > 0 ? (potentialPayout / betAmount).toFixed(2) : '2.00';
  const isHighROI = parseFloat(multiplier) > 2;

  const displayName = traderName || (traderAddress.length > 10
    ? `${traderAddress.slice(0, 6)}...${traderAddress.slice(-4)}`
    : 'Whale Trader');

  // Identicon URL - use PNG format for Satori compatibility
  const identiconUrl = traderAddress
    ? `https://api.dicebear.com/7.x/identicon/png?seed=${traderAddress}&size=56`
    : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const betFormatted = formatCurrency(betAmount);
  const payoutFormatted = formatCurrency(potentialPayout);

  // Colors matching the site design
  const outcomeColor = isYes ? '#4ade80' : '#f87171';
  const outcomeBgColor = isYes ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)';

  // Payout color: gold for high ROI, green for Yes, red/pink for No
  const payoutColor = isHighROI ? '#facc15' : outcomeColor;

  const displayQuestion = question.length > 80 ? question.slice(0, 80) + '...' : question;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#030303',
          position: 'relative',
        }}
      >
        {/* Aurora Background Effect */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 20% 20%, rgba(74, 222, 128, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
          }}
        />

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: 48,
            position: 'relative',
          }}
        >
          {/* Card Container - Glassmorphism style */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* LEFT SIDE - 70% */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '70%',
                padding: 40,
                justifyContent: 'space-between',
              }}
            >
              {/* Trader Info Row */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                {/* Avatar - identicon or gradient circle */}
                <div
                  style={{
                    display: 'flex',
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                    overflow: 'hidden',
                  }}
                >
                  {identiconUrl ? (
                    <img
                      src={identiconUrl}
                      width={56}
                      height={56}
                      style={{ width: 56, height: 56 }}
                    />
                  ) : (
                    <span style={{ fontSize: 24 }}>🐋</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 20, fontWeight: 600, color: 'rgba(255, 255, 255, 0.9)' }}>
                    {displayName}
                  </span>
                  {traderName && traderAddress && (
                    <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                      {traderAddress.slice(0, 6)}...{traderAddress.slice(-4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Market Question with Event Image */}
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 20 }}>
                {eventImage && (
                  <div
                    style={{
                      display: 'flex',
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(59, 130, 246, 0.3))',
                    }}
                  >
                    <img
                      src={eventImage}
                      width={80}
                      height={80}
                      style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                  </div>
                )}
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: 'white',
                    lineHeight: 1.3,
                  }}
                >
                  {displayQuestion}
                </span>
              </div>

              {/* Outcome Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    padding: '12px 24px',
                    borderRadius: 12,
                    backgroundColor: outcomeBgColor,
                    color: outcomeColor,
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {outcome}
                </div>
                {isHighROI && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '12px 16px',
                      borderRadius: 12,
                      backgroundColor: 'rgba(250, 204, 21, 0.1)',
                      color: '#facc15',
                      fontSize: 16,
                      fontWeight: 600,
                    }}
                  >
                    <span>📈</span>
                    <span>High ROI</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE - 30% */}
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
              {/* Bet Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 32 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: 'rgba(255, 255, 255, 0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  Bet Amount
                </span>
                <span style={{ fontSize: 36, fontWeight: 700, color: 'white' }}>
                  {betFormatted}
                </span>
              </div>

              {/* Potential Payout */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: 'rgba(255, 255, 255, 0.6)',
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    marginBottom: 8,
                  }}
                >
                  Potential Payout
                </span>
                <span
                  style={{
                    fontSize: 42,
                    fontWeight: 900,
                    color: payoutColor,
                  }}
                >
                  {payoutFormatted}
                </span>
                <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.4)', marginTop: 8 }}>
                  {multiplier}x return
                </span>
              </div>
            </div>
          </div>

          {/* Footer - Branding like Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 20,
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: -1 }}>
                polywave
              </span>
              {/* Gradient line like in Header */}
              <div
                style={{
                  display: 'flex',
                  width: 180,
                  height: 4,
                  background: 'linear-gradient(to right, #4ade80, #a855f7)',
                  borderRadius: 2,
                  marginTop: 4,
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 32 }}>🐋</span>
              <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.4)' }}>
                polywave.trade
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
