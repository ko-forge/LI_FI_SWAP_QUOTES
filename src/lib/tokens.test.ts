import { describe, expect, it } from 'vitest'
import { NATIVE_TOKEN_ADDRESS } from './constants'
import {
  createTokenCatalog,
  filterTokens,
  getToken,
  pickDefaultFromToken,
  pickDefaultToToken,
  slimToken,
} from './tokens'
import { makeToken, nativeEth, randomToken, usdc, usdt } from '../test/fixtures'

describe('slimToken', () => {
  it('keeps only the fields needed by the UI', () => {
    const token = makeToken({ tags: ['stablecoin'] })

    expect(slimToken(token)).toEqual({
      address: token.address,
      chainId: token.chainId,
      symbol: token.symbol,
      decimals: token.decimals,
      name: token.name,
      logoURI: token.logoURI,
      priceUSD: token.priceUSD,
      coinKey: token.coinKey,
    })
    expect(slimToken(token)).not.toHaveProperty('tags')
  })
})


describe('createTokenCatalog', () => {
  it('sorts popular symbols first and indexes by lowercase address', () => {
    const catalog = createTokenCatalog([randomToken, usdc, nativeEth])

    expect(catalog.list.map((token) => token.symbol)).toEqual([
      'ETH',
      'USDC',
      'AAA',
    ])
    expect(catalog.byAddress[NATIVE_TOKEN_ADDRESS]).toMatchObject({
      symbol: 'ETH',
    })
    expect(catalog.byAddress[usdc.address.toLowerCase()]?.symbol).toBe('USDC')
  })
})

describe('getToken', () => {
  it('looks up tokens case-insensitively', () => {
    const catalog = createTokenCatalog([usdc])

    expect(getToken(catalog, usdc.address.toUpperCase())?.symbol).toBe('USDC')
    expect(getToken(catalog, null)).toBeNull()
    expect(getToken(undefined, usdc.address)).toBeNull()
  })
})

describe('pickDefaultFromToken', () => {
  it('prefers the native token, then ETH, then the first token', () => {
    expect(pickDefaultFromToken([usdc, nativeEth, randomToken]).symbol).toBe(
      'ETH',
    )
    expect(
      pickDefaultFromToken([
        usdc,
        makeToken({
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          symbol: 'ETH',
          name: 'Wrapped placeholder',
        }),
      ]).symbol,
    ).toBe('ETH')
    expect(pickDefaultFromToken([usdc, randomToken]).symbol).toBe('USDC')
  })
})

describe('pickDefaultToToken', () => {
  it('prefers USDC, then USDT, then a different token from the from-side', () => {
    expect(pickDefaultToToken([randomToken, usdc, usdt], nativeEth.address).symbol).toBe(
      'USDC',
    )
    expect(pickDefaultToToken([randomToken, usdt], nativeEth.address).symbol).toBe(
      'USDT',
    )
    expect(pickDefaultToToken([usdc], usdc.address).symbol).toBe('USDC')

    const dai = makeToken({
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      coinKey: 'DAI',
    })
    expect(pickDefaultToToken([randomToken, dai], randomToken.address).symbol).toBe(
      'DAI',
    )
  })
})


describe('filterTokens', () => {
  const list = [
    nativeEth,
    usdc,
    usdt,
    makeToken({
      address: '0x2222222222222222222222222222222222222222',
      symbol: 'WETH',
      name: 'Wrapped Ether',
    }),
  ]

  it('returns the first page when the query is empty', () => {
    expect(filterTokens(list, '', 2)).toHaveLength(2)
  })

  it('ranks prefix matches ahead of contains matches', () => {
    const results = filterTokens(list, 'eth')
    expect(results[0]?.symbol).toBe('ETH')
    expect(results.map((token) => token.symbol)).toContain('WETH')
  })

  it('matches by address', () => {
    const results = filterTokens(list, usdc.address.slice(0, 10).toLowerCase())
    expect(results.some((token) => token.symbol === 'USDC')).toBe(true)
  })
})
