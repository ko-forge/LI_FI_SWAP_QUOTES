import { useQuery } from '@tanstack/react-query'
import { getQuote } from '../api/lifi/endpoints'
import { lifiKeys } from '../api/lifi/query-keys'
import type { QuoteParams } from '../api/lifi/types'

export function useQuote(params: QuoteParams | null) {
  return useQuery({
    queryKey: params ? lifiKeys.quote(params) : [...lifiKeys.all, 'quote', 'idle'],
    queryFn: () => getQuote(params!),
    enabled: params !== null,
    staleTime: 15_000,
    retry: false,
  })
}
