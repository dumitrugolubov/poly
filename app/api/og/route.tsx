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
    ? `https://api.dicebear.com/7.x/identicon/png?seed=${traderAddress}&size=80`
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
  const payoutColor = isHighROI ? '#facc15' : outcomeColor;

  const displayQuestion = question.length > 90 ? question.slice(0, 90) + '...' : question;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Background with aurora effect */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#0a0a0a',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111111 100%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 10% 20%, rgba(74, 222, 128, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(168, 85, 247, 0.12) 0%, transparent 50%)',
          }}
        />

        {/* TICKET CONTENT */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            padding: 40,
            position: 'relative',
          }}
        >
          {/* LEFT SIDE - 68% */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '68%',
              paddingRight: 32,
              justifyContent: 'space-between',
            }}
          >
            {/* Trader Info */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 20,
                  overflow: 'hidden',
                }}
              >
                {identiconUrl ? (
                  <img
                    src={identiconUrl}
                    width={64}
                    height={64}
                    style={{ width: 64, height: 64 }}
                  />
                ) : (
                  <span style={{ fontSize: 28 }}>🐋</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>
                  {displayName}
                </span>
                {traderName && traderAddress && (
                  <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.5)', fontFamily: 'monospace' }}>
                    {traderAddress.slice(0, 6)}...{traderAddress.slice(-4)}
                  </span>
                )}
              </div>
            </div>

            {/* Question - HERO */}
            <div style={{ display: 'flex', flex: 1, alignItems: 'center', paddingTop: 24, paddingBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                {eventImage && (
                  <div
                    style={{
                      display: 'flex',
                      width: 100,
                      height: 100,
                      borderRadius: 16,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(59, 130, 246, 0.3))',
                    }}
                  >
                    <img
                      src={eventImage}
                      width={100}
                      height={100}
                      style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                  </div>
                )}
                <span
                  style={{
                    fontSize: 38,
                    fontWeight: 800,
                    color: 'white',
                    lineHeight: 1.2,
                  }}
                >
                  {displayQuestion}
                </span>
              </div>
            </div>

            {/* Outcome Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  display: 'flex',
                  padding: '14px 32px',
                  borderRadius: 14,
                  backgroundColor: outcomeBgColor,
                  color: outcomeColor,
                  fontSize: 28,
                  fontWeight: 800,
                }}
              >
                {outcome}
              </div>
              {isHighROI && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 20px',
                    borderRadius: 14,
                    backgroundColor: 'rgba(250, 204, 21, 0.15)',
                    color: '#facc15',
                    fontSize: 18,
                    fontWeight: 700,
                  }}
                >
                  <span>📈</span>
                  <span>High ROI</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - 32% */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '32%',
              borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
              paddingLeft: 32,
              justifyContent: 'space-between',
            }}
          >
            {/* Top: Branding */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>polywave</span>
                <span style={{ fontSize: 24 }}>🐋</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  width: 140,
                  height: 3,
                  background: 'linear-gradient(to right, #4ade80, #a855f7)',
                  borderRadius: 2,
                  marginTop: 6,
                }}
              />
            </div>

            {/* Middle: Financials */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {/* Bet Amount */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 24 }}>
                <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
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
                  padding: 20,
                }}
              >
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 }}>
                  Potential Payout
                </span>
                <span style={{ fontSize: 44, fontWeight: 900, color: payoutColor }}>
                  {payoutFormatted}
                </span>
                <span style={{ fontSize: 16, color: 'rgba(255, 255, 255, 0.4)', marginTop: 6 }}>
                  {multiplier}x return
                </span>
              </div>
            </div>

            {/* Bottom: Site URL */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.3)', fontWeight: 500 }}>
                polywave.trade
              </span>
            </div>
          </div>
        </div>

        {/* Ticket edge decoration - left */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 20,
            height: 40,
            backgroundColor: '#000',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
          }}
        />
        {/* Ticket edge decoration - right */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 20,
            height: 40,
            backgroundColor: '#000',
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
