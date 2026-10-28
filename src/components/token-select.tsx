import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { LifiToken } from '../api/lifi/types'
import { TokenLogo } from './token-logo'

interface TokenSelectProps {
  label: string
  tokens: LifiToken[]
  value: string | null
  onChange: (tokenAddress: string) => void
  disabled?: boolean
  isLoading?: boolean
}

const MAX_RESULTS = 80

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
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = useMemo(
    () => tokens.find((token) => token.address.toLowerCase() === value?.toLowerCase()) ?? null,
    [tokens, value],
  )

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return tokens.slice(0, MAX_RESULTS)

    return tokens
      .filter((token) => {
        return (
          token.symbol.toLowerCase().includes(normalized) ||
          token.name.toLowerCase().includes(normalized) ||
          token.address.toLowerCase().includes(normalized)
        )
      })
      .slice(0, MAX_RESULTS)
  }, [tokens, query])

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
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled || isLoading}
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm outline-none transition hover:border-zinc-300 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
        onClick={() => setOpen((current) => !current)}
      >
        {isLoading ? (
          <span className="text-zinc-500">Loading tokens…</span>
        ) : selected ? (
          <>
            <TokenLogo src={selected.logoURI} alt={selected.symbol} />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-zinc-900">{selected.symbol}</span>
              <span className="block truncate text-xs text-zinc-500">{selected.name}</span>
            </span>
          </>
        ) : (
          <span className="text-zinc-500">Select a token</span>
        )}
        <span className="text-zinc-400">▾</span>
      </button>

      {open ? (
        <div className="relative z-20">
          <div className="absolute inset-x-0 top-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
            <div className="border-b border-zinc-100 p-2">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search symbol, name, or address"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-64 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-3 text-sm text-zinc-500">No tokens found</li>
              ) : (
                filtered.map((token) => {
                  const isSelected =
                    token.address.toLowerCase() === selected?.address.toLowerCase()

                  return (
                    <li key={`${token.chainId}-${token.address}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-zinc-50 ${
                          isSelected ? 'bg-zinc-50' : ''
                        }`}
                        onClick={() => {
                          onChange(token.address)
                          setOpen(false)
                          setQuery('')
                        }}
                      >
                        <TokenLogo src={token.logoURI} alt={token.symbol} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium text-zinc-900">
                            {token.symbol}
                          </span>
                          <span className="block truncate text-xs text-zinc-500">
                            {token.name}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {shortenAddress(token.address)}
                        </span>
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function shortenAddress(address: string) {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}
