import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCrypto(amount: number, symbol: string = 'BTC'): string {
  return `${amount.toFixed(8)} ${symbol}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function calculateROI(principal: number, rate: number, days: number): number {
  return (principal * rate * days) / 100
}

export function calculateDailyEarning(amount: number, dailyRate: number): number {
  return (amount * dailyRate) / 100
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function truncateAddress(address: string, start: number = 6, end: number = 4): string {
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

export function generateQRCodeUrl(address: string, amount?: number, label?: string): string {
  let qrData = address
  if (amount) qrData += `?amount=${amount}`
  if (label) qrData += `${amount ? '&' : '?'}label=${encodeURIComponent(label)}`
  
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
}

export const CRYPTO_ADDRESSES = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ETH: '0x742d35Cc6634C0532925a3b8D4e6e3a8b0a3b0a3',
  USDT: '0x742d35Cc6634C0532925a3b8D4e6e3a8b0a3b0a3',
} as const

export type CryptoType = keyof typeof CRYPTO_ADDRESSES
