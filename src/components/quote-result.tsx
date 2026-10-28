import type { ReactNode } from 'react'
import type { QuoteResponse } from '../api/lifi/types'
import { LifiApiError } from '../api/lifi/client'
import {
  formatDurationSeconds,
  formatTokenAmount,
  formatUsd,
} from '../lib/format'
import { TokenLogo } from './token-logo'

interface QuoteResultProps {
  quote?: QuoteResponse
  isFetching: boolean
  isError: boolean
  error: Error | null
  ready: boolean
}

export function QuoteResult({
  quote,
  isFetching,
  isError,
  error,
  ready,
}: QuoteResultProps) {
  if (!ready) {
    return (
      <EmptyState message="Choose chains, tokens, and an amount to see a quote." />
    )
  }

  if (isFetching && !quote) {
    return <EmptyState message="Fetching quote…" />
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-medium">Couldn’t fetch a quote</p>
        <p className="mt-1 text-red-600/90">
          {error instanceof LifiApiError
            ? error.message
            : error?.message || 'Something went wrong.'}
        </p>
      </div>
    )
  }

  if (!quote) return null

  const { action, estimate, toolDetails } = quote
  const gasUsd = estimate.gasCosts
    ?.map((cost) => Number(cost.amountUSD ?? 0))
    .filter((value) => Number.isFinite(value))
    .reduce((sum, value) => sum + value, 0)

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-500">You receive</h3>
          <div className="mt-2 flex items-center gap-3">
            <TokenLogo src={action.toToken.logoURI} alt={action.toToken.symbol} size="md" />
            <div>
              <p className="text-2xl font-semibold tracking-tight text-zinc-900">
                {formatTokenAmount(estimate.toAmount, action.toToken)}
              </p>
              <p className="text-sm text-zinc-500">
                {formatUsd(estimate.toAmountUSD) ?? '—'}
              </p>
            </div>
          </div>
        </div>
        {isFetching ? (
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500">
            Updating…
          </span>
        ) : null}
      </div>

      <dl className="mt-5 grid gap-3 border-t border-zinc-100 pt-4 text-sm sm:grid-cols-2">
        <Detail label="Min received" value={formatTokenAmount(estimate.toAmountMin, action.toToken)} />
        <Detail label="Send value" value={formatUsd(estimate.fromAmountUSD) ?? '—'} />
        <Detail
          label="Route"
          value={
            <span className="inline-flex items-center gap-2">
              <TokenLogo src={toolDetails.logoURI} alt={toolDetails.name} />
              {toolDetails.name}
            </span>
          }
        />
        <Detail
          label="Est. time"
          value={formatDurationSeconds(estimate.executionDuration) ?? '—'}
        />
        <Detail
          label="Network gas"
          value={gasUsd ? formatUsd(gasUsd) : '—'}
        />
        <Detail
          label="Slippage"
          value={
            action.slippage !== undefined
              ? `${(action.slippage * 100).toFixed(2)}%`
              : '—'
          }
        />
      </dl>
    </section>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 sm:block sm:space-y-1">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
      {message}
    </div>
  )
}
