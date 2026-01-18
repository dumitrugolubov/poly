# Polywave Whale Watcher 🐋

A high-end visualization app for tracking large Polymarket trades with a stunning Aurora Simplex Noise animated background.

## Features

### 1. Aurora Simplex Noise Background
- Real-time animated canvas background using simplex-noise
- Dynamic color gradients from green (120 hue) to purple (260 hue)
- Smooth wave-like motion creating an immersive visual experience

### 2. Live Whale Feed
- Tracks Polymarket bets over $5,000
- **Real data** from The Graph + Gamma API
- Real-time updates every 30 seconds
- **Horizontal Ticket Layout** (16:9 aspect ratio) - optimized for Twitter sharing
- **Two-column design:**
  - Left (60%): Trader profile (name, avatar, Twitter) + Event image + Market question (hero text)
  - Right (40%): Financial data with massive payout display
- **Responsive**: Vertical stack on mobile, horizontal on desktop
- **Rich metadata**: Real trader names, profile pictures, Twitter handles, event images

### 3. Dual Sharing System

#### Client-Side PNG Download
- "Download Ticket" button appears on hover
- **Fixed 1200x675 (16:9) export** - perfect for Twitter/social media
- Includes "POLYWAVE.TRADE" watermark and ticket ID
- Uses html-to-image with Aurora-style gradient background
- Creates collectible PNG images with consistent aspect ratio

#### Social Sharing (OG Images)
- Dynamic Open Graph images for Twitter/social media
- Custom `/api/og` endpoint using @vercel/og
- Shows whale alerts with the Polywave branding

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animation**: simplex-noise
- **Data**: graphql-request (Polymarket Subgraph)
- **Image Generation**: @vercel/og, html-to-image
- **Icons**: lucide-react

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Data Source

**Production Mode (Default):** The app fetches **real whale trades** from Polymarket:

### Data Pipeline

1. **The Graph (Polygon Subgraph)**
   - Endpoint: `https://api.thegraph.com/subgraphs/name/polymarket/matic-graph-subgraph`
   - Fetches: Recent transactions over $5,000
   - Data: Trade amount, user address, market ID, timestamp

2. **Gamma API (Market Metadata)**
   - Endpoint: `https://gamma-api.polymarket.com/markets?id={marketId}`
   - Enriches with: Event images, cleaner titles

3. **Gamma API (User Profiles)**
   - Endpoint: `https://gamma-api.polymarket.com/profiles/{address}`
   - Enriches with: Display names, avatars, Twitter handles, bios

### Fallback

If APIs are unavailable, the app automatically falls back to mock data with similar structure.

## Environment Variables

Create a `.env.local` file (optional):

```bash
# Base URL for production
NEXT_PUBLIC_BASE_URL=https://yourapp.vercel.app

# Optional: Custom Polymarket API endpoint
NEXT_PUBLIC_POLYMARKET_API=https://your-polymarket-api-endpoint
```

## Project Structure

```
poly/
├── app/
│   ├── api/og/          # OG image generation
│   ├── layout.tsx       # Root layout with AuroraBackground
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles + gradients
├── components/
│   ├── AuroraBackground.tsx  # Simplex noise animation
│   ├── WhaleCard.tsx         # Horizontal ticket card (16:9)
│   ├── Feed.tsx              # Main feed + download logic
│   ├── Stats.tsx             # Stats overview cards
│   └── Header.tsx            # App header with branding
├── lib/
│   ├── types.ts         # TypeScript types
│   ├── utils.ts         # Utility functions
│   └── polymarket.ts    # Polymarket API integration
└── DESIGN.md            # Design system documentation
```

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/polywave)

## License

MIT
