import { useEffect, useMemo, useState } from 'react'
import { useChains } from '../hooks/use-chains'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { useQuote } from '../hooks/use-quote'
import { usePrefetchTokenCatalogs, useTokens } from '../hooks/use-tokens'
import { QUOTE_FROM_ADDRESS } from '../lib/constants'
import {
  formatUsd,
  isPositiveAmount,
  parseAmountToBaseUnits,
} from '../lib/format'
import {
  getToken,
  pickDefaultFromToken,
  pickDefaultToToken,
} from '../lib/tokens'
import { AmountInput } from './amount-input'
import { ChainSelect } from './chain-select'
import { QuoteResult } from './quote-result'
import { TokenSelect } from './token-select'

const DEFAULT_FROM_CHAIN_ID = 1
const DEFAULT_TO_CHAIN_ID = 8453
const PREFETCH_CHAIN_IDS = [1, 8453, 42161, 10, 137]

export function SwapForm() {
  const chainsQuery = useChains()
  const chains = chainsQuery.data ?? []
  usePrefetchTokenCatalogs(PREFETCH_CHAIN_IDS)

  const [fromChainId, setFromChainId] = useState<number | null>(null)
  const [toChainId, setToChainId] = useState<number | null>(null)
  const [fromTokenAddress, setFromTokenAddress] = useState<string | null>(null)
  const [toTokenAddress, setToTokenAddress] = useState<string | null>(null)
  const [amount, setAmount] = useState('1')
  const [swapping, setSwapping] = useState(false)

  const fromTokensQuery = useTokens(fromChainId)
  const toTokensQuery = useTokens(toChainId)
  const fromCatalog = fromTokensQuery.data
  const toCatalog = toTokensQuery.data
  const fromTokens = fromCatalog?.list ?? []
  const toTokens = toCatalog?.list ?? []

  const fromToken = getToken(fromCatalog, fromTokenAddress)
  const toToken = getToken(toCatalog, toTokenAddress)

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
    if (fromTokenAddress && fromCatalog?.byAddress[fromTokenAddress.toLowerCase()]) {
      return
    }
    setFromTokenAddress(pickDefaultFromToken(fromTokens).address)
  }, [fromTokens, fromTokenAddress, fromCatalog])

  useEffect(() => {
    if (!toTokens.length) return
    if (toTokenAddress && toCatalog?.byAddress[toTokenAddress.toLowerCase()]) {
      return
    }
    setToTokenAddress(pickDefaultToToken(toTokens, fromTokenAddress).address)
  }, [toTokens, toTokenAddress, fromTokenAddress, toCatalog])

  const amountError = useMemo(() => {
    if (!amount.trim()) return 'Enter an amount'
    if (!isPositiveAmount(amount)) return 'Amount must be greater than zero'
    if (!fromToken) return null
    if (parseAmountToBaseUnits(amount, fromToken.decimals) === null) {
      return `Use at most ${fromToken.decimals} decimal places`
    }
    return null
  }, [amount, fromToken])

  const debouncedAmount = useDebouncedValue(amount, 400)

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
  const sendUsd =
    quoteQuery.data &&
    quoteParams &&
    quoteQuery.data.action.fromToken.address.toLowerCase() ===
      fromToken?.address.toLowerCase()
      ? formatUsd(quoteQuery.data.estimate.fromAmountUSD)
      : null

  function swapSides() {
    setSwapping(true)
    setFromChainId(toChainId)
    setToChainId(fromChainId)
    setFromTokenAddress(toTokenAddress)
    setToTokenAddress(fromTokenAddress)
    window.setTimeout(() => setSwapping(false), 220)
  }

  return (
    <div className="space-y-5">
      <section className="panel overflow-visible">
        <div className="space-y-4">
          <div className="leg">
            <p className="eyebrow">You pay</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
              <AmountInput
                id="from-amount"
                label="Amount"
                value={amount}
                onChange={setAmount}
                symbol={fromToken?.symbol}
                usdHint={sendUsd}
                error={amount.trim() ? amountError : null}
              />
              <div className="grid gap-3">
                <ChainSelect
                  id="from-chain"
                  label="Chain"
                  chains={chains}
                  value={fromChainId}
                  onChange={(chainId) => {
                    setFromChainId(chainId)
                    setFromTokenAddress(null)
                  }}
                  isLoading={chainsQuery.isLoading}
                />
                <TokenSelect
                  label="Token"
                  tokens={fromTokens}
                  value={fromTokenAddress}
                  onChange={setFromTokenAddress}
                  isLoading={fromTokensQuery.isLoading}
                  disabled={fromChainId === null}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swapSides}
              className={`switch-button ${swapping ? 'switch-button-spin' : ''}`}
              aria-label="Swap from and to"
            >
              <SwitchIcon />
            </button>
          </div>

          <div className="leg">
            <p className="eyebrow">You receive</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ChainSelect
                id="to-chain"
                label="Chain"
                chains={chains}
                value={toChainId}
                onChange={(chainId) => {
                  setToChainId(chainId)
                  setToTokenAddress(null)
                }}
                isLoading={chainsQuery.isLoading}
              />
              <TokenSelect
                label="Token"
                tokens={toTokens}
                value={toTokenAddress}
                onChange={setToTokenAddress}
                isLoading={toTokensQuery.isLoading}
                disabled={toChainId === null}
              />
            </div>
          </div>
        </div>

        {chainsQuery.isError ? (
          <p className="mt-4 text-sm text-[var(--danger)]">
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

function SwitchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M7 7h11l-3-3M17 17H6l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
