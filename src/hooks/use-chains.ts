import { useQuery } from '@tanstack/react-query'
import { getChains } from '../api/lifi/endpoints'
import { lifiKeys } from '../api/lifi/query-keys'

export function useChains() {
  return useQuery({
    queryKey: lifiKeys.chains(),
    queryFn: getChains,
    staleTime: 60 * 60_000,
    select: (chains) =>
      chains
        .filter((chain) => chain.mainnet && chain.chainType === 'EVM')
        .sort((a, b) => a.name.localeCompare(b.name)),
  })
}
