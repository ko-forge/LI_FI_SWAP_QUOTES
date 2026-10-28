import { createTokenCatalog, type TokenCatalog } from '../../lib/tokens'
import { lifiFetch } from './client'
import type {
  ChainsResponse,
  LifiChain,
  QuoteParams,
  QuoteResponse,
  TokensResponse,
} from './types'

export async function getChains(): Promise<LifiChain[]> {
  const data = await lifiFetch<ChainsResponse>('/chains', {
    chainTypes: 'EVM',
  })

  return data.chains
    .filter((chain) => chain.mainnet)
    .map((chain) => ({
      key: chain.key,
      chainType: chain.chainType,
      name: chain.name,
      coin: chain.coin,
      id: chain.id,
      mainnet: chain.mainnet,
      logoURI: chain.logoURI,
      nativeToken: {
        address: chain.nativeToken.address,
        chainId: chain.nativeToken.chainId,
        symbol: chain.nativeToken.symbol,
        decimals: chain.nativeToken.decimals,
        name: chain.nativeToken.name,
        logoURI: chain.nativeToken.logoURI,
        priceUSD: chain.nativeToken.priceUSD,
        coinKey: chain.nativeToken.coinKey,
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function getTokenCatalog(chainId: number): Promise<TokenCatalog> {
  const data = await lifiFetch<TokensResponse>('/tokens', {
    chains: chainId,
  })

  return createTokenCatalog(data.tokens[String(chainId)] ?? [])
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
