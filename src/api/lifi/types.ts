export type ChainType = 'EVM' | 'SVM' | 'UTXO' | 'MVM' | string

export interface LifiToken {
  address: string
  chainId: number
  symbol: string
  decimals: number
  name: string
  coinKey?: string
  logoURI?: string
  priceUSD?: string
  tags?: string[]
}

export interface LifiChain {
  key: string
  chainType: ChainType
  name: string
  coin: string
  id: number
  mainnet: boolean
  logoURI?: string
  nativeToken: LifiToken
}

export interface ChainsResponse {
  chains: LifiChain[]
}

export interface TokensResponse {
  tokens: Record<string, LifiToken[]>
}

export interface QuoteParams {
  fromChain: number | string
  toChain: number | string
  fromToken: string
  toToken: string
  fromAmount: string
  fromAddress: string
  toAddress?: string
  order?: 'FASTEST' | 'CHEAPEST'
  slippage?: number
}

export interface FeeCost {
  name: string
  description?: string
  token: LifiToken
  amount: string
  amountUSD?: string
  percentage?: string
  included?: boolean
}

export interface GasCost {
  type: string
  amount: string
  amountUSD?: string
  token: LifiToken
  estimate?: string
}

export interface QuoteEstimate {
  tool: string
  toAmount: string
  toAmountMin: string
  fromAmount: string
  fromAmountUSD?: string
  toAmountUSD?: string
  executionDuration?: number
  feeCosts?: FeeCost[]
  gasCosts?: GasCost[]
}

export interface QuoteAction {
  fromToken: LifiToken
  toToken: LifiToken
  fromAmount: string
  fromChainId: number
  toChainId: number
  slippage?: number
  fromAddress?: string
  toAddress?: string
}

export interface ToolDetails {
  key: string
  name: string
  logoURI?: string
}

export interface QuoteResponse {
  type: string
  id: string
  tool: string
  toolDetails: ToolDetails
  action: QuoteAction
  estimate: QuoteEstimate
}

export interface LifiApiErrorBody {
  message?: string
  code?: number | string
  errors?: Array<{ message?: string }>
}
