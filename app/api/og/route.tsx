import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#0a0a0a',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: '60px',
            color: 'white',
          }}
        >
          Hello World
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
