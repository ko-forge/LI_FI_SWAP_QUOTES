import { useState } from 'react'

const failedLogos = new Set<string>()

interface TokenLogoProps {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClass = {
  sm: 'h-5 w-5 text-[10px]',
  md: 'h-7 w-7 text-[11px]',
  lg: 'h-9 w-9 text-xs',
} as const

export function TokenLogo({ src, alt, size = 'sm' }: TokenLogoProps) {
  const [failed, setFailed] = useState(() => !src || failedLogos.has(src))
  const dimension = sizeClass[size]

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] font-semibold text-[var(--ink-muted)]`}
      >
        {alt.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      className={`${dimension} shrink-0 rounded-full bg-[var(--surface-muted)] object-cover`}
      onError={() => {
        failedLogos.add(src)
        setFailed(true)
      }}
    />
  )
}
