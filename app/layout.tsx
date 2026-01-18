import type { Metadata } from 'next';
import './globals.css';
import AuroraBackground from '@/components/AuroraBackground';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://polywave.trade'),
  title: 'Polywave - Whale Watcher',
  description: 'Track large bets on Polymarket in real-time',
  openGraph: {
    title: 'Polywave - Whale Watcher',
    description: 'Track large bets on Polymarket in real-time',
    images: ['/api/og'],
    siteName: 'Polywave',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Polywave - Whale Watcher',
    description: 'Track large bets on Polymarket in real-time',
    images: ['/api/og'],
    site: '@polywave',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuroraBackground />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
