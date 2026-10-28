import type { QuoteParams } from './types'

export const lifiKeys = {
  all: ['lifi'] as const,
  chains: () => [...lifiKeys.all, 'chains'] as const,
  tokens: (chainId: number) => [...lifiKeys.all, 'tokens', chainId] as const,
  quote: (params: QuoteParams) => [...lifiKeys.all, 'quote', params] as const,
}
