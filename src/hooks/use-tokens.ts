import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getTokenCatalog } from '../api/lifi/endpoints'
import { lifiKeys } from '../api/lifi/query-keys'

export function useTokens(chainId: number | null) {
  return useQuery({
    queryKey: lifiKeys.tokens(chainId ?? -1),
    queryFn: () => getTokenCatalog(chainId!),
    enabled: chainId !== null,
    staleTime: 30 * 60_000,
    gcTime: 2 * 60 * 60_000,
  })
}

/** Warm popular chain catalogs in the background after first paint. */
export function usePrefetchTokenCatalogs(chainIds: readonly number[]) {
  const queryClient = useQueryClient()
  const key = chainIds.join(',')

  useEffect(() => {
    const ids = key
      .split(',')
      .map(Number)
      .filter((id) => Number.isFinite(id))

    for (const chainId of ids) {
      void queryClient.prefetchQuery({
        queryKey: lifiKeys.tokens(chainId),
        queryFn: () => getTokenCatalog(chainId),
        staleTime: 30 * 60_000,
      })
    }
  }, [key, queryClient])
}
