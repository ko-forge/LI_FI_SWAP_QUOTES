/**
 * Quote endpoint requires a wallet address to build a transaction request.
 * This app never connects a wallet, so we use LI.FI's documented example
 * address purely for quote estimation.
 */
export const QUOTE_FROM_ADDRESS = '0x552008c0f6870c2f77e5cC1d2eb9bdff03e30Ea0'

export const NATIVE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'

export const POPULAR_TOKEN_SYMBOLS = [
  'ETH',
  'WETH',
  'USDC',
  'USDT',
  'DAI',
  'WBTC',
  'BNB',
  'MATIC',
  'POL',
  'AVAX',
  'SOL',
] as const
