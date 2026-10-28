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
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <div className="relative">
        <select
          id={id}
          className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pr-10 pl-3 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400"
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
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400">
          ▾
        </span>
      </div>
      {value !== null ? (
        <SelectedChainPreview chain={chains.find((chain) => chain.id === value)} />
      ) : null}
    </label>
  )
}

function SelectedChainPreview({ chain }: { chain?: LifiChain }) {
  if (!chain) return null

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500">
      <TokenLogo src={chain.logoURI} alt={chain.name} />
      <span>
        {chain.name} · id {chain.id}
      </span>
    </div>
  )
}
