import { describe, expect, it } from 'vitest'
import {
  formatBaseUnits,
  formatDurationSeconds,
  formatReadableAmount,
  formatTokenAmount,
  formatUsd,
  isPositiveAmount,
  parseAmountToBaseUnits,
} from './format'

describe('parseAmountToBaseUnits', () => {
  it('converts whole amounts', () => {
    expect(parseAmountToBaseUnits('1', 18)).toBe('1000000000000000000')
    expect(parseAmountToBaseUnits('1', 6)).toBe('1000000')
  })

  it('converts fractional amounts and pads decimals', () => {
    expect(parseAmountToBaseUnits('1.5', 6)).toBe('1500000')
    expect(parseAmountToBaseUnits('0.000001', 6)).toBe('1')
  })

  it('trims whitespace', () => {
    expect(parseAmountToBaseUnits(' 2 ', 6)).toBe('2000000')
  })

  it('rejects empty, invalid, or overly precise values', () => {
    expect(parseAmountToBaseUnits('', 6)).toBeNull()
    expect(parseAmountToBaseUnits('abc', 6)).toBeNull()
    expect(parseAmountToBaseUnits('1.2345678', 6)).toBeNull()
    expect(parseAmountToBaseUnits('-1', 6)).toBeNull()
  })
})

describe('formatBaseUnits', () => {
  it('formats whole and fractional base units', () => {
    expect(formatBaseUnits('1000000', 6)).toBe('1')
    expect(formatBaseUnits('1500000', 6)).toBe('1.5')
    expect(formatBaseUnits('1', 6)).toBe('0.000001')
  })

  it('returns the original string for invalid bigint input', () => {
    expect(formatBaseUnits('not-a-number', 6)).toBe('not-a-number')
  })
})

describe('formatTokenAmount', () => {
  it('includes the token symbol', () => {
    expect(
      formatTokenAmount('1500000', { decimals: 6, symbol: 'USDC' }),
    ).toBe('1.5 USDC')
  })
})

describe('formatUsd', () => {
  it('formats numeric USD values', () => {
    expect(formatUsd('1234.5')).toBe('$1,234.50')
    expect(formatUsd(10)).toBe('$10.00')
  })

  it('returns null for missing or invalid values', () => {
    expect(formatUsd(null)).toBeNull()
    expect(formatUsd(undefined)).toBeNull()
    expect(formatUsd('')).toBeNull()
    expect(formatUsd('nope')).toBeNull()
  })
})

describe('formatDurationSeconds', () => {
  it('formats seconds and minutes', () => {
    expect(formatDurationSeconds(2)).toBe('~2s')
    expect(formatDurationSeconds(0.2)).toBe('~1s')
    expect(formatDurationSeconds(90)).toBe('~2m')
  })

  it('returns null when duration is missing', () => {
    expect(formatDurationSeconds(undefined)).toBeNull()
  })
})

describe('formatReadableAmount', () => {
  it('formats readable numbers and falls back for invalid input', () => {
    expect(formatReadableAmount('1234.56789')).toBe('1,234.56789')
    expect(formatReadableAmount('abc')).toBe('abc')
  })
})

describe('isPositiveAmount', () => {
  it('accepts positive amounts only', () => {
    expect(isPositiveAmount('1')).toBe(true)
    expect(isPositiveAmount('0.1')).toBe(true)
    expect(isPositiveAmount('0')).toBe(false)
    expect(isPositiveAmount('-1')).toBe(false)
    expect(isPositiveAmount('abc')).toBe(false)
  })
})
