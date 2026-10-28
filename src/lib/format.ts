import type { LifiToken } from '../api/lifi/types'

const amountFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 8,
})

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function parseAmountToBaseUnits(value: string, decimals: number): string | null {
  const trimmed = value.trim()
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) return null

  const [wholePart, fractionPart = ''] = trimmed.split('.')
  if (fractionPart.length > decimals) return null

  const paddedFraction = fractionPart.padEnd(decimals, '0')
  const combined = `${wholePart}${paddedFraction}`.replace(/^0+(?=\d)/, '')

  try {
    return BigInt(combined || '0').toString()
  } catch {
    return null
  }
}

export function formatBaseUnits(amount: string, decimals: number, maxFractionDigits = 8): string {
  try {
    const value = BigInt(amount)
    const base = 10n ** BigInt(decimals)
    const whole = value / base
    const fraction = value % base

    if (fraction === 0n) return whole.toString()

    const fractionText = fraction
      .toString()
      .padStart(decimals, '0')
      .replace(/0+$/, '')
      .slice(0, maxFractionDigits)

    return fractionText ? `${whole}.${fractionText}` : whole.toString()
  } catch {
    return amount
  }
}

export function formatTokenAmount(amount: string, token: Pick<LifiToken, 'decimals' | 'symbol'>) {
  return `${formatBaseUnits(amount, token.decimals)} ${token.symbol}`
}

export function formatUsd(value?: string | number | null) {
  if (value === undefined || value === null || value === '') return null
  const numeric = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numeric)) return null
  return usdFormatter.format(numeric)
}

export function formatDurationSeconds(seconds?: number) {
  if (seconds === undefined || seconds === null) return null
  if (seconds < 60) return `~${Math.max(1, Math.round(seconds))}s`
  const minutes = Math.round(seconds / 60)
  return `~${minutes}m`
}

export function formatReadableAmount(value: string) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return value
  return amountFormatter.format(numeric)
}

export function isPositiveAmount(value: string) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0
}
