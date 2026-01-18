import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const amount = searchParams.get('amount') || '50,000';
    const outcome = searchParams.get('outcome') || 'WHALE';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #000000 0%, #0f0c29 50%, #1a0a33 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Top Section */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                fontSize: '80px',
                fontWeight: 900,
                background: 'linear-gradient(to right, #00ff88, #8b5cf6)',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-2px',
              }}
            >
              polywave
            </div>
            <div
              style={{
                width: '400px',
                height: '6px',
                background: 'linear-gradient(to right, #00ff88, #8b5cf6)',
                borderRadius: '999px',
                marginTop: '10px',
              }}
            />
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '60px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '30px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '20px',
                letterSpacing: '2px',
              }}
            >
              🐋 WHALE ALERT
            </div>
            <div
              style={{
                fontSize: '120px',
                fontWeight: 900,
                background: 'linear-gradient(to right, #00ff88, #8b5cf6)',
                backgroundClip: 'text',
                color: 'transparent',
                marginBottom: '20px',
              }}
            >
              ${amount}
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: outcome === 'Yes' ? '#00ff88' : '#ff4444',
                textTransform: 'uppercase',
              }}
            >
              {outcome}
            </div>
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              height: '10px',
              background: 'linear-gradient(to right, #00ff88, #8b5cf6)',
            }}
          />
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
