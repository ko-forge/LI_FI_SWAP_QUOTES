import type { LifiToken } from '../api/lifi/types'
import { NATIVE_TOKEN_ADDRESS, POPULAR_TOKEN_SYMBOLS } from './constants'

export interface TokenCatalog {
  list: LifiToken[]
  byAddress: Record<string, LifiToken>
}

function popularityRank(symbol: string) {
  const index = POPULAR_TOKEN_SYMBOLS.indexOf(
    symbol.toUpperCase() as (typeof POPULAR_TOKEN_SYMBOLS)[number],
  )
  return index === -1 ? POPULAR_TOKEN_SYMBOLS.length : index
}

export function slimToken(token: LifiToken): LifiToken {
  return {
    address: token.address,
    chainId: token.chainId,
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    logoURI: token.logoURI,
    priceUSD: token.priceUSD,
    coinKey: token.coinKey,
  }
}

export function createTokenCatalog(tokens: LifiToken[]): TokenCatalog {
  const list = tokens
    .map(slimToken)
    .sort((a, b) => {
      const rankDiff = popularityRank(a.symbol) - popularityRank(b.symbol)
      if (rankDiff !== 0) return rankDiff
      return a.symbol.localeCompare(b.symbol) || a.name.localeCompare(b.name)
    })

  const byAddress: Record<string, LifiToken> = {}
  for (const token of list) {
    byAddress[token.address.toLowerCase()] = token
  }

  return { list, byAddress }
}

export function getToken(
  catalog: TokenCatalog | undefined,
  address: string | null,
): LifiToken | null {
  if (!catalog || !address) return null
  return catalog.byAddress[address.toLowerCase()] ?? null
}

export function pickDefaultFromToken(list: LifiToken[]) {
  return (
    list.find((token) => token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS) ||
    list.find((token) => token.symbol.toUpperCase() === 'ETH') ||
    list[0]
  )
}

export function pickDefaultToToken(list: LifiToken[], fromTokenAddress: string | null) {
  return (
    list.find((token) => token.symbol.toUpperCase() === 'USDC') ||
    list.find((token) => token.symbol.toUpperCase() === 'USDT') ||
    list.find(
      (token) => token.address.toLowerCase() !== fromTokenAddress?.toLowerCase(),
    ) ||
    list[0]
  )
}

export function filterTokens(list: LifiToken[], query: string, limit = 200) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return list.slice(0, limit)

  const startsWith: LifiToken[] = []
  const contains: LifiToken[] = []

  for (const token of list) {
    const symbol = token.symbol.toLowerCase()
    const name = token.name.toLowerCase()
    const address = token.address.toLowerCase()

    if (symbol.startsWith(normalized) || name.startsWith(normalized)) {
      startsWith.push(token)
    } else if (
      symbol.includes(normalized) ||
      name.includes(normalized) ||
      address.includes(normalized)
    ) {
      contains.push(token)
    }
  }

  return startsWith.concat(contains).slice(0, limit)
}
