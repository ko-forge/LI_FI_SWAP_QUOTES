interface AmountInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  symbol?: string
  usdHint?: string | null
  disabled?: boolean
  error?: string | null
}

export function AmountInput({
  id,
  label,
  value,
  onChange,
  symbol,
  usdHint,
  disabled,
  error,
}: AmountInputProps) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      <span className="field-label">{label}</span>
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
          className={`amount-input ${error ? 'amount-input-error' : ''}`}
        />
        {symbol ? (
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-mono text-sm text-[var(--ink-muted)]">
            {symbol}
          </span>
        ) : null}
      </div>
      {usdHint ? (
        <p className="text-xs text-[var(--ink-muted)]">≈ {usdHint}</p>
      ) : null}
      {error ? <p className="text-xs text-[var(--danger)]">{error}</p> : null}
    </label>
  )
}
