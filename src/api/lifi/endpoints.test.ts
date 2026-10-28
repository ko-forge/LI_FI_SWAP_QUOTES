import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeChain, makeToken, nativeEth, usdc } from '../../test/fixtures'
import { getChains, getQuote, getTokenCatalog } from './endpoints'

vi.mock('./client', () => ({
  lifiFetch: vi.fn(),
}))

import { lifiFetch } from './client'

const mockedFetch = vi.mocked(lifiFetch)

describe('getChains', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it('keeps mainnet chains, slims native tokens, and sorts by name', async () => {
    mockedFetch.mockResolvedValue({
      chains: [
        makeChain({ id: 8453, key: 'bas', name: 'Base', mainnet: true }),
        makeChain({ id: 1, key: 'eth', name: 'Ethereum', mainnet: true }),
        makeChain({
          id: 11155111,
          key: 'sep',
          name: 'Sepolia',
          mainnet: false,
        }),
      ],
    })

    const chains = await getChains()

    expect(mockedFetch).toHaveBeenCalledWith('/chains', { chainTypes: 'EVM' })
    expect(chains.map((chain) => chain.name)).toEqual(['Base', 'Ethereum'])
    expect(chains[0]?.nativeToken).toMatchObject({
      symbol: 'ETH',
      address: nativeEth.address,
    })
    expect(chains[0]?.nativeToken).not.toHaveProperty('tags')
  })
})

describe('getTokenCatalog', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it('builds a catalog for the requested chain', async () => {
    mockedFetch.mockResolvedValue({
      tokens: {
        '1': [usdc, nativeEth],
        '8453': [makeToken({ chainId: 8453, symbol: 'USDC' })],
      },
    })

    const catalog = await getTokenCatalog(1)

    expect(mockedFetch).toHaveBeenCalledWith('/tokens', { chains: 1 })
    expect(catalog.list.map((token) => token.symbol)).toEqual(['ETH', 'USDC'])
    expect(catalog.byAddress[nativeEth.address.toLowerCase()]?.symbol).toBe(
      'ETH',
    )
  })

  it('returns an empty catalog when the chain is missing', async () => {
    mockedFetch.mockResolvedValue({ tokens: {} })

    const catalog = await getTokenCatalog(999)

    expect(catalog.list).toEqual([])
    expect(catalog.byAddress).toEqual({})
  })
})

describe('getQuote', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
  })

  it('forwards quote params to /quote', async () => {
    const quote = { id: 'quote-1' }
    mockedFetch.mockResolvedValue(quote)

    const params = {
      fromChain: 1,
      toChain: 8453,
      fromToken: nativeEth.address,
      toToken: usdc.address,
      fromAmount: '1000000000000000000',
      fromAddress: '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0',
      order: 'CHEAPEST' as const,
      slippage: 0.005,
    }

    await expect(getQuote(params)).resolves.toEqual(quote)
    expect(mockedFetch).toHaveBeenCalledWith('/quote', {
      fromChain: 1,
      toChain: 8453,
      fromToken: nativeEth.address,
      toToken: usdc.address,
      fromAmount: '1000000000000000000',
      fromAddress: params.fromAddress,
      toAddress: undefined,
      order: 'CHEAPEST',
      slippage: 0.005,
    })
  })
})
