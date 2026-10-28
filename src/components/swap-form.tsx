import { useEffect, useMemo, useState } from 'react'
import type { LifiToken } from '../api/lifi/types'
import { useChains } from '../hooks/use-chains'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { useQuote } from '../hooks/use-quote'
import { useTokens } from '../hooks/use-tokens'
import { QUOTE_FROM_ADDRESS } from '../lib/constants'
import {
  isPositiveAmount,
  parseAmountToBaseUnits,
} from '../lib/format'
import { AmountInput } from './amount-input'
import { ChainSelect } from './chain-select'
import { QuoteResult } from './quote-result'
import { TokenSelect } from './token-select'

const DEFAULT_FROM_CHAIN_ID = 1
const DEFAULT_TO_CHAIN_ID = 8453

export function SwapForm() {
  const chainsQuery = useChains()
  const chains = chainsQuery.data ?? []

  const [fromChainId, setFromChainId] = useState<number | null>(null)
  const [toChainId, setToChainId] = useState<number | null>(null)
  const [fromTokenAddress, setFromTokenAddress] = useState<string | null>(null)
  const [toTokenAddress, setToTokenAddress] = useState<string | null>(null)
  const [amount, setAmount] = useState('1')

  const fromTokensQuery = useTokens(fromChainId)
  const toTokensQuery = useTokens(toChainId)
  const fromTokens = fromTokensQuery.data ?? []
  const toTokens = toTokensQuery.data ?? []

  const fromToken = findToken(fromTokens, fromTokenAddress)
  const toToken = findToken(toTokens, toTokenAddress)

  useEffect(() => {
    if (!chains.length || fromChainId !== null) return

    const preferredFrom =
      chains.find((chain) => chain.id === DEFAULT_FROM_CHAIN_ID) ?? chains[0]
    const preferredTo =
      chains.find((chain) => chain.id === DEFAULT_TO_CHAIN_ID) ??
      chains.find((chain) => chain.id !== preferredFrom.id) ??
      preferredFrom

    setFromChainId(preferredFrom.id)
    setToChainId(preferredTo.id)
  }, [chains, fromChainId])

  useEffect(() => {
    if (!fromTokens.length) return
    if (
      fromTokenAddress &&
      fromTokens.some(
        (token) => token.address.toLowerCase() === fromTokenAddress.toLowerCase(),
      )
    ) {
      return
    }
    setFromTokenAddress(pickDefaultFromToken(fromTokens).address)
  }, [fromTokens, fromTokenAddress])

  useEffect(() => {
    if (!toTokens.length) return
    if (
      toTokenAddress &&
      toTokens.some(
        (token) => token.address.toLowerCase() === toTokenAddress.toLowerCase(),
      )
    ) {
      return
    }
    setToTokenAddress(pickDefaultToToken(toTokens, fromTokenAddress).address)
  }, [toTokens, toTokenAddress, fromTokenAddress])

  const amountError = useMemo(() => {
    if (!amount.trim()) return 'Enter an amount'
    if (!isPositiveAmount(amount)) return 'Amount must be greater than zero'
    if (!fromToken) return null
    if (parseAmountToBaseUnits(amount, fromToken.decimals) === null) {
      return `Use at most ${fromToken.decimals} decimal places`
    }
    return null
  }, [amount, fromToken])

  const debouncedAmount = useDebouncedValue(amount, 450)

  const quoteParams = useMemo(() => {
    if (
      fromChainId === null ||
      toChainId === null ||
      !fromToken ||
      !toToken ||
      !debouncedAmount.trim() ||
      !isPositiveAmount(debouncedAmount)
    ) {
      return null
    }

    const fromAmount = parseAmountToBaseUnits(debouncedAmount, fromToken.decimals)
    if (!fromAmount || fromAmount === '0') return null

    if (
      fromChainId === toChainId &&
      fromToken.address.toLowerCase() === toToken.address.toLowerCase()
    ) {
      return null
    }

    return {
      fromChain: fromChainId,
      toChain: toChainId,
      fromToken: fromToken.address,
      toToken: toToken.address,
      fromAmount,
      fromAddress: QUOTE_FROM_ADDRESS,
    }
  }, [fromChainId, toChainId, fromToken, toToken, debouncedAmount])

  const quoteQuery = useQuote(quoteParams)

  function swapSides() {
    setFromChainId(toChainId)
    setToChainId(fromChainId)
    setFromTokenAddress(toTokenAddress)
    setToTokenAddress(fromTokenAddress)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <ChainSelect
            id="from-chain"
            label="From chain"
            chains={chains}
            value={fromChainId}
            onChange={(chainId) => {
              setFromChainId(chainId)
              setFromTokenAddress(null)
            }}
            isLoading={chainsQuery.isLoading}
          />
          <TokenSelect
            label="From token"
            tokens={fromTokens}
            value={fromTokenAddress}
            onChange={setFromTokenAddress}
            isLoading={fromTokensQuery.isLoading}
            disabled={fromChainId === null}
          />
        </div>

        <div className="my-4 flex justify-center">
          <button
            type="button"
            onClick={swapSides}
            className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            aria-label="Swap from and to"
          >
            ↕ Switch
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChainSelect
            id="to-chain"
            label="To chain"
            chains={chains}
            value={toChainId}
            onChange={(chainId) => {
              setToChainId(chainId)
              setToTokenAddress(null)
            }}
            isLoading={chainsQuery.isLoading}
          />
          <TokenSelect
            label="To token"
            tokens={toTokens}
            value={toTokenAddress}
            onChange={setToTokenAddress}
            isLoading={toTokensQuery.isLoading}
            disabled={toChainId === null}
          />
        </div>

        <div className="mt-4">
          <AmountInput
            id="from-amount"
            label="Amount"
            value={amount}
            onChange={setAmount}
            symbol={fromToken?.symbol}
            error={amount.trim() ? amountError : null}
          />
        </div>

        {chainsQuery.isError ? (
          <p className="mt-4 text-sm text-red-600">
            Failed to load chains:{' '}
            {chainsQuery.error instanceof Error
              ? chainsQuery.error.message
              : 'Unknown error'}
          </p>
        ) : null}
      </section>

      <QuoteResult
        quote={quoteQuery.data}
        isFetching={quoteQuery.isFetching}
        isError={quoteQuery.isError}
        error={quoteQuery.error}
        ready={quoteParams !== null && !amountError}
      />
    </div>
  )
}

function findToken(tokens: LifiToken[], address: string | null) {
  if (!address) return null
  return (
    tokens.find((token) => token.address.toLowerCase() === address.toLowerCase()) ??
    null
  )
}

function pickDefaultFromToken(tokens: LifiToken[]) {
  return (
    tokens.find((token) => token.address === '0x0000000000000000000000000000000000000000') ||
    tokens.find((token) => token.symbol.toUpperCase() === 'ETH') ||
    tokens[0]
  )
}

function pickDefaultToToken(tokens: LifiToken[], fromTokenAddress: string | null) {
  const preferred =
    tokens.find((token) => token.symbol.toUpperCase() === 'USDC') ||
    tokens.find((token) => token.symbol.toUpperCase() === 'USDT') ||
    tokens.find(
      (token) =>
        token.address.toLowerCase() !== fromTokenAddress?.toLowerCase(),
    ) ||
    tokens[0]

  return preferred
}
