import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LifiApiError } from '../api/lifi/client'
import type { QuoteResponse } from '../api/lifi/types'
import { nativeEth, usdc } from '../test/fixtures'
import { QuoteResult } from './quote-result'

const quote = {
  type: 'lifi',
  id: 'quote-1',
  tool: 'across',
  toolDetails: {
    key: 'across',
    name: 'Across',
    logoURI: 'https://example.com/across.svg',
  },
  action: {
    fromToken: nativeEth,
    toToken: usdc,
    fromAmount: '1000000000000000000',
    fromChainId: 1,
    toChainId: 8453,
    slippage: 0.005,
  },
  estimate: {
    tool: 'across',
    toAmount: '2500000000',
    toAmountMin: '2480000000',
    fromAmount: '1000000000000000000',
    fromAmountUSD: '2500',
    toAmountUSD: '2500',
    executionDuration: 12,
    gasCosts: [
      {
        type: 'SEND',
        amount: '1',
        amountUSD: '1.25',
        token: nativeEth,
      },
    ],
  },
} satisfies QuoteResponse

describe('QuoteResult', () => {
  it('shows an empty state when the form is not ready', () => {
    render(
      <QuoteResult
        ready={false}
        isFetching={false}
        isError={false}
        error={null}
      />,
    )

    expect(
      screen.getByText('Enter an amount to fetch a live LI.FI quote.'),
    ).toBeInTheDocument()
  })

  it('renders quote details', () => {
    render(
      <QuoteResult
        ready
        quote={quote}
        isFetching={false}
        isError={false}
        error={null}
      />,
    )

    expect(screen.getByText('You receive')).toBeInTheDocument()
    expect(screen.getByText('2500 USDC')).toBeInTheDocument()
    expect(screen.getByText('Across')).toBeInTheDocument()
    expect(screen.getByText('~12s')).toBeInTheDocument()
    expect(screen.getByText('0.50%')).toBeInTheDocument()
  })

  it('renders API errors', () => {
    render(
      <QuoteResult
        ready
        isFetching={false}
        isError
        error={new LifiApiError(400, { message: 'No routes found' }, 'fallback')}
      />,
    )

    expect(screen.getByText('Couldn’t fetch a quote')).toBeInTheDocument()
    expect(screen.getByText('No routes found')).toBeInTheDocument()
  })
})
