import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function getIdenticonUrl(address: string): string {
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${address}`;
}

/**
 * Safely calculate multiplier avoiding division by zero
 */
export function calculateMultiplier(potentialPayout: number, betAmount: number): string {
  if (!betAmount || betAmount <= 0 || !isFinite(betAmount)) {
    return '0.0';
  }
  if (!potentialPayout || !isFinite(potentialPayout)) {
    return '0.0';
  }
  const multiplier = potentialPayout / betAmount;
  return isFinite(multiplier) ? multiplier.toFixed(1) : '0.0';
}

/**
 * Safely parse a number from string, returning default if invalid
 */
export function safeParseFloat(value: string | undefined | null, defaultValue: number = 0): number {
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isFinite(parsed) ? parsed : defaultValue;
}

/**
 * Validate outcome is Yes or No
 */
export function isValidOutcome(value: string | undefined | null): value is 'Yes' | 'No' {
  return value === 'Yes' || value === 'No';
}

/**
 * Format amount for display (e.g., $5K, $1.2M)
 */
export function formatCompactCurrency(value: number): string {
  if (!isFinite(value) || value <= 0) return '$0';
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${Math.round(value / 1000)}K`;
  return `$${value.toLocaleString()}`;
}
