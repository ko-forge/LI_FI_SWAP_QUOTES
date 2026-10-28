import { useMemo } from 'react'
import type { LifiChain } from '../api/lifi/types'
import { TokenLogo } from './token-logo'

interface ChainSelectProps {
  id: string
  label: string
  chains: LifiChain[]
  value: number | null
  onChange: (chainId: number) => void
  disabled?: boolean
  isLoading?: boolean
}

export function ChainSelect({
  id,
  label,
  chains,
  value,
  onChange,
  disabled,
  isLoading,
}: ChainSelectProps) {
  const selected = useMemo(
    () => chains.find((chain) => chain.id === value) ?? null,
    [chains, value],
  )

  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="field-label">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2">
          {selected ? (
            <TokenLogo src={selected.logoURI} alt={selected.name} />
          ) : (
            <span className="block h-5 w-5 rounded-full bg-[var(--surface-muted)]" />
          )}
        </div>
        <select
          id={id}
          className="field-select"
          value={value ?? ''}
          disabled={disabled || isLoading || chains.length === 0}
          onChange={(event) => onChange(Number(event.target.value))}
        >
          {isLoading ? <option value="">Loading chains…</option> : null}
          {!isLoading && chains.length === 0 ? (
            <option value="">No chains available</option>
          ) : null}
          {chains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[var(--ink-muted)]">
          ▾
        </span>
      </div>
    </label>
  )
}
