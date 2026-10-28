import { useQuery } from '@tanstack/react-query'
import { getChains } from '../api/lifi/endpoints'
import { lifiKeys } from '../api/lifi/query-keys'

export function useChains() {
  return useQuery({
    queryKey: lifiKeys.chains(),
    queryFn: getChains,
    staleTime: 60 * 60_000,
    gcTime: 24 * 60 * 60_000,
  })
}
