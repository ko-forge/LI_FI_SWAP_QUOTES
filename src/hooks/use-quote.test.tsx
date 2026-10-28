import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useQuote } from './use-quote'

vi.mock('../api/lifi/endpoints', () => ({
  getQuote: vi.fn(),
}))

import { getQuote } from '../api/lifi/endpoints'

const mockedGetQuote = vi.mocked(getQuote)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useQuote', () => {
  beforeEach(() => {
    mockedGetQuote.mockReset()
  })

  it('does not fetch when params are null', async () => {
    const { result } = renderHook(() => useQuote(null), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedGetQuote).not.toHaveBeenCalled()
  })

  it('fetches a quote when params are provided', async () => {
    mockedGetQuote.mockResolvedValue({ id: 'quote-1' } as never)

    const params = {
      fromChain: 1,
      toChain: 8453,
      fromToken: 'ETH',
      toToken: 'USDC',
      fromAmount: '1000000000000000000',
      fromAddress: '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0',
    }

    const { result } = renderHook(() => useQuote(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockedGetQuote).toHaveBeenCalledWith(params)
    expect(result.current.data).toEqual({ id: 'quote-1' })
  })
})
