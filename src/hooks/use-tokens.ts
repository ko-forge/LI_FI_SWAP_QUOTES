import { useQuery } from '@tanstack/react-query'
import { getTokens } from '../api/lifi/endpoints'
import { lifiKeys } from '../api/lifi/query-keys'
import { POPULAR_TOKEN_SYMBOLS } from '../lib/constants'
import type { LifiToken } from '../api/lifi/types'

function popularityRank(symbol: string) {
  const index = POPULAR_TOKEN_SYMBOLS.indexOf(
    symbol.toUpperCase() as (typeof POPULAR_TOKEN_SYMBOLS)[number],
  )
  return index === -1 ? POPULAR_TOKEN_SYMBOLS.length : index
}

export function sortTokens(tokens: LifiToken[]) {
  return [...tokens].sort((a, b) => {
    const rankDiff = popularityRank(a.symbol) - popularityRank(b.symbol)
    if (rankDiff !== 0) return rankDiff
    return a.symbol.localeCompare(b.symbol) || a.name.localeCompare(b.name)
  })
}

export function useTokens(chainId: number | null) {
  return useQuery({
    queryKey: lifiKeys.tokens(chainId ?? -1),
    queryFn: () => getTokens(chainId!),
    enabled: chainId !== null,
    staleTime: 30 * 60_000,
    select: sortTokens,
  })
}
