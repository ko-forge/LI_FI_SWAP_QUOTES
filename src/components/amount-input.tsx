interface AmountInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  symbol?: string
  disabled?: boolean
  error?: string | null
}

export function AmountInput({
  id,
  label,
  value,
  onChange,
  symbol,
  disabled,
  error,
}: AmountInputProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <div className="relative">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.0"
          disabled={disabled}
          value={value}
          onChange={(event) => {
            const next = event.target.value.replace(/,/g, '')
            if (next === '' || /^\d*\.?\d*$/.test(next)) {
              onChange(next)
            }
          }}
          className={`w-full rounded-xl border bg-white py-2.5 pr-16 pl-3 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-zinc-50 ${
            error
              ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
              : 'border-zinc-200 focus:border-zinc-400 focus:ring-zinc-200'
          }`}
        />
        {symbol ? (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-zinc-500">
            {symbol}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </label>
  )
}
