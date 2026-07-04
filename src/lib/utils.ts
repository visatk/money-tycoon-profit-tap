import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a currency number to compact notation.
 * e.g. 1234567 → "$1.23M"
 */
export function formatCurrency(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '$0'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`
  return `${sign}$${abs.toFixed(0)}`
}

/**
 * Format income rate.
 * e.g. 1234 → "$1.2K/s"
 */
export function formatRate(perSecond: number): string {
  return `${formatCurrency(perSecond)}/s`
}

/**
 * Format elapsed seconds to human-readable.
 * e.g. 9000 → "2h 30m"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * Format a timestamp to a relative "X ago" string.
 */
export function formatRelativeTime(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Generate a seeded random number (deterministic) between 0 and 1.
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/**
 * Format a percentage with sign.
 * e.g. 3.5 → "+3.50%"
 */
export function formatPct(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

