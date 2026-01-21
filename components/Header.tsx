'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, TrendingUp, Trophy, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Whale Trades', icon: Activity },
  { href: '/markets', label: 'Markets', icon: TrendingUp },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 border-b border-white/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-4xl font-black tracking-tight hover:text-purple-400 transition-colors">
              polywave
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-green-400 to-purple-600 rounded-full mt-2" />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1 md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Telegram CTA */}
          <Link
            href="https://t.me/polywavebot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 glassmorphism rounded-lg hover:bg-white/10 transition-all duration-200 group"
          >
            <span className="text-sm font-semibold">Telegram</span>
            <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Subtitle - only on home page */}
        {pathname === '/' && (
          <div className="mt-4">
            <p className="text-white/60 text-sm">
              Track whale trades on Polymarket in real-time. Bets over $5,000.
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
