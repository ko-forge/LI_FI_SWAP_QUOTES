import type { LifiChain, LifiToken } from '../api/lifi/types'
import { NATIVE_TOKEN_ADDRESS } from '../lib/constants'

export function makeToken(overrides: Partial<LifiToken> = {}): LifiToken {
  return {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    chainId: 1,
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    logoURI: 'https://example.com/usdc.png',
    priceUSD: '1',
    coinKey: 'USDC',
    ...overrides,
  }
}

export const nativeEth = makeToken({
  address: NATIVE_TOKEN_ADDRESS,
  symbol: 'ETH',
  name: 'ETH',
  decimals: 18,
  coinKey: 'ETH',
  priceUSD: '2500',
})

export const usdc = makeToken()

export const usdt = makeToken({
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  symbol: 'USDT',
  name: 'Tether USD',
  coinKey: 'USDT',
})

export const randomToken = makeToken({
  address: '0x1111111111111111111111111111111111111111',
  symbol: 'AAA',
  name: 'Alpha Asset',
  coinKey: 'AAA',
})

export function makeChain(overrides: Partial<LifiChain> = {}): LifiChain {
  return {
    key: 'eth',
    chainType: 'EVM',
    name: 'Ethereum',
    coin: 'ETH',
    id: 1,
    mainnet: true,
    logoURI: 'https://example.com/eth.svg',
    nativeToken: nativeEth,
    ...overrides,
  }
}
