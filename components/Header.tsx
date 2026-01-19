'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative z-20 border-b border-white/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              polywave
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-green-400 to-purple-600 rounded-full mt-2" />
          </div>

          <Link
            href="https://t.me/polywavebot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 glassmorphism rounded-lg hover:bg-white/10 transition-all duration-200 group"
          >
            <span className="text-sm font-semibold">Join Telegram</span>
            <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="mt-4">
          <p className="text-white/60 text-sm">
            Track whale trades on Polymarket in real-time. Bets over $2,500.
          </p>
        </div>
      </div>
    </header>
  );
}
