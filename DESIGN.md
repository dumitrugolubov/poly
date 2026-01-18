# Polywave Design System

## Layout Architecture

### Horizontal Ticket Layout (16:9)

The whale cards use a **horizontal ticket design** optimized for Twitter sharing:

```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────┐  │  ┌──────────────────────────┐  │
│  │  LEFT COLUMN    │  │  │   RIGHT COLUMN          │  │
│  │  (60%)          │  │  │   (40%)                 │  │
│  │                 │  │  │                         │  │
│  │  🧑 Trader Info │  │  │   BET AMOUNT            │  │
│  │                 │  │  │   $25,000               │  │
│  │  ─────────────  │  │  │                         │  │
│  │                 │  │  │   ┌────────────────┐    │  │
│  │  Will Bitcoin   │  │  │   │ PAYOUT         │    │  │
│  │  reach $100K?   │  │  │   │ $45,000        │    │  │
│  │  (Hero Text)    │  │  │   │ 1.80x return   │    │  │
│  │                 │  │  │   └────────────────┘    │  │
│  │  ─────────────  │  │  │                         │  │
│  │                 │  │  │                         │  │
│  │  [YES]  High ROI│  │  │                         │  │
│  └─────────────────┘  │  └──────────────────────────┘  │
│                           POLYWAVE.TRADE • ID: 1      │
└─────────────────────────────────────────────────────────┘
```

## Responsive Behavior

- **Mobile (`< md`)**: Vertical stack layout
- **Desktop (`≥ md`)**: Horizontal two-column layout

## Color System

### Gradients

- **Aurora Primary**: Green (#00ff88) → Purple (#8b5cf6)
- **Gold Gradient**: Yellow (#fbbf24) → Amber (#f59e0b) (High ROI payouts)
- **Red Gradient**: Red (#f87171) → Pink (#ec4899) (No bets)

### Outcome Colors

- **Yes**: Green (#4ade80)
- **No**: Red (#f87171)
- **High ROI** (>2.5x): Gold (#fbbf24)

## Typography

- **Market Question**: 2xl-3xl, Bold, White
- **Payout Amount**: 4xl-6xl, Black weight, Gradient
- **Bet Amount**: 3xl-4xl, Bold, White
- **Labels**: xs-sm, Uppercase, Tracking-wide, White/60

## Branding Elements

### Watermark
- **Position**: Bottom-right, absolute
- **Content**: "POLYWAVE.TRADE" + Ticket ID
- **Style**: Opacity 30%, Mono font, White/60
- **Purpose**: Viral marketing when shared on social media

### Download Button
- **Behavior**: Hidden by default, appears on card hover
- **Position**: Top-right, absolute
- **Style**: Green → Purple gradient
- **Icon**: Download icon from lucide-react

## Glassmorphism Specs

```css
.glassmorphism {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## Stats Cards

Three-column grid showing:
1. **Total Volume** (Green icon)
2. **Potential Payout** (Purple icon)
3. **Average Bet Size** (Yellow icon)

## Export Specifications

### PNG Download
- **Dimensions**: 1200x675px (16:9)
- **Background**: Aurora gradient (Black → Dark Green → Dark Purple)
- **Quality**: 2x pixel ratio
- **Watermark**: 50% opacity (more visible than on-screen)

### OG Images
- **Dimensions**: 1200x630px (Twitter recommended)
- **Format**: PNG via @vercel/og
- **Content**: Whale alert + Amount + Polywave branding

## Animation

- **Card Hover**: scale(1.01) + shadow
- **Button Hover**: Gradient shift + shadow increase
- **Background**: Aurora simplex noise (continuous flow)

## Accessibility

- High contrast text (White on dark)
- Clear visual hierarchy
- Semantic HTML structure
- Hover states for interactive elements
