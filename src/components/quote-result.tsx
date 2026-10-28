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
    return <EmptyState message="Enter an amount to fetch a live LI.FI quote." />
  }

  if (isFetching && !quote) {
    return <QuoteSkeleton />
  }

  if (isError && !quote) {
    return (
      <div className="panel panel-danger animate-rise">
        <p className="font-semibold">Couldn’t fetch a quote</p>
        <p className="mt-1 text-sm opacity-90">
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
    <section className={`panel animate-rise ${isFetching ? 'opacity-80' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">You receive</p>
          <div className="mt-3 flex items-center gap-3">
            <TokenLogo src={action.toToken.logoURI} alt={action.toToken.symbol} size="lg" />
            <div>
              <p className="font-mono text-3xl font-semibold tracking-tight text-[var(--ink)]">
                {formatTokenAmount(estimate.toAmount, action.toToken)}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                {formatUsd(estimate.toAmountUSD) ?? '—'}
              </p>
            </div>
          </div>
        </div>
        {isFetching ? <span className="status-chip">Updating</span> : null}
        {isError ? <span className="status-chip status-chip-warn">Stale</span> : null}
      </div>

      <dl className="mt-6 grid gap-3 border-t border-[var(--line)] pt-4 text-sm sm:grid-cols-2">
        <Detail
          label="Min received"
          value={formatTokenAmount(estimate.toAmountMin, action.toToken)}
        />
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
        <Detail label="Network gas" value={gasUsd ? formatUsd(gasUsd) : '—'} />
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

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 sm:block sm:space-y-1">
      <dt className="text-[var(--ink-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--ink)]">{value}</dd>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="empty-panel">
      <p>{message}</p>
    </div>
  )
}

function QuoteSkeleton() {
  return (
    <div className="panel animate-pulse">
      <div className="h-3 w-24 rounded bg-[var(--surface-muted)]" />
      <div className="mt-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[var(--surface-muted)]" />
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-[var(--surface-muted)]" />
          <div className="h-3 w-20 rounded bg-[var(--surface-muted)]" />
        </div>
      </div>
      <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-16 rounded bg-[var(--surface-muted)]" />
            <div className="h-4 w-28 rounded bg-[var(--surface-muted)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
