import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { LifiToken } from '../api/lifi/types'
import { useDebouncedValue } from '../hooks/use-debounced-value'
import { filterTokens } from '../lib/tokens'
import { TokenLogo } from './token-logo'

interface TokenSelectProps {
  label: string
  tokens: LifiToken[]
  value: string | null
  onChange: (tokenAddress: string) => void
  disabled?: boolean
  isLoading?: boolean
}

const ROW_HEIGHT = 52

export function TokenSelect({
  label,
  tokens,
  value,
  onChange,
  disabled,
  isLoading,
}: TokenSelectProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 120)

  const selected = useMemo(() => {
    if (!value) return null
    return tokens.find((token) => token.address.toLowerCase() === value.toLowerCase()) ?? null
  }, [tokens, value])

  const filtered = useMemo(
    () => (open ? filterTokens(tokens, debouncedQuery) : []),
    [tokens, debouncedQuery, open],
  )

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
    enabled: open,
  })

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="block space-y-1.5" ref={containerRef}>
      <span className="field-label">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled || isLoading}
        className="token-trigger"
        onClick={() => setOpen((current) => !current)}
      >
        {isLoading ? (
          <span className="text-[var(--ink-muted)]">Loading…</span>
        ) : selected ? (
          <>
            <TokenLogo src={selected.logoURI} alt={selected.symbol} size="md" />
            <span className="min-w-0 flex-1 text-left">
              <span className="block font-semibold text-[var(--ink)]">
                {selected.symbol}
              </span>
              <span className="block truncate text-xs text-[var(--ink-muted)]">
                {selected.name}
              </span>
            </span>
          </>
        ) : (
          <span className="text-[var(--ink-muted)]">Select token</span>
        )}
        <ChevronIcon />
      </button>

      {open ? (
        <div className="relative z-30">
          <div className="token-menu animate-rise">
            <div className="border-b border-[var(--line)] p-2">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search symbol, name, or address"
                className="field-input"
              />
            </div>
            <div
              id={listboxId}
              role="listbox"
              ref={parentRef}
              className="max-h-72 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-[var(--ink-muted)]">No tokens found</p>
              ) : (
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((item) => {
                    const token = filtered[item.index]!
                    const isSelected =
                      token.address.toLowerCase() === selected?.address.toLowerCase()

                    return (
                      <div
                        key={token.address}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${item.size}px`,
                          transform: `translateY(${item.start}px)`,
                        }}
                      >
                        <TokenOption
                          token={token}
                          selected={isSelected}
                          onSelect={() => {
                            onChange(token.address)
                            setOpen(false)
                            setQuery('')
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const TokenOption = memo(function TokenOption({
  token,
  selected,
  onSelect,
}: {
  token: LifiToken
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={`flex h-full w-full items-center gap-3 px-3 text-left text-sm transition hover:bg-[var(--surface-muted)] ${
        selected ? 'bg-[var(--surface-muted)]' : ''
      }`}
      onClick={onSelect}
    >
      <TokenLogo src={token.logoURI} alt={token.symbol} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-[var(--ink)]">{token.symbol}</span>
        <span className="block truncate text-xs text-[var(--ink-muted)]">{token.name}</span>
      </span>
      <span className="font-mono text-[10px] text-[var(--ink-faint)]">
        {shortenAddress(token.address)}
      </span>
    </button>
  )
})

function shortenAddress(address: string) {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className="h-4 w-4 shrink-0 text-[var(--ink-muted)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
