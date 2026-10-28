import { useState } from 'react'

interface TokenLogoProps {
  src?: string
  alt: string
  size?: 'sm' | 'md'
}

export function TokenLogo({ src, alt, size = 'sm' }: TokenLogoProps) {
  const [failed, setFailed] = useState(false)
  const dimension = size === 'sm' ? 'h-5 w-5' : 'h-8 w-8'

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-600`}
      >
        {alt.slice(0, 1).toUpperCase()}
      </span>
    )
  }

  return (
    <img
      src={src}
      alt=""
      className={`${dimension} shrink-0 rounded-full bg-zinc-100 object-cover`}
      onError={() => setFailed(true)}
    />
  )
}
