import { lifiFetch } from './client'
import type {
  ChainsResponse,
  LifiChain,
  LifiToken,
  QuoteParams,
  QuoteResponse,
  TokensResponse,
} from './types'

export async function getChains(): Promise<LifiChain[]> {
  const data = await lifiFetch<ChainsResponse>('/chains')
  return data.chains
}

export async function getTokens(chainId: number): Promise<LifiToken[]> {
  const data = await lifiFetch<TokensResponse>('/tokens', {
    chains: chainId,
  })

  return data.tokens[String(chainId)] ?? []
}

export async function getQuote(params: QuoteParams): Promise<QuoteResponse> {
  return lifiFetch<QuoteResponse>('/quote', {
    fromChain: params.fromChain,
    toChain: params.toChain,
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.fromAmount,
    fromAddress: params.fromAddress,
    toAddress: params.toAddress,
    order: params.order,
    slippage: params.slippage,
  })
}
