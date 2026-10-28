import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('1', 400))
    expect(result.current).toBe('1')
  })

  it('updates only after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      { initialProps: { value: '1' } },
    )

    rerender({ value: '2' })
    expect(result.current).toBe('1')

    act(() => {
      vi.advanceTimersByTime(399)
    })
    expect(result.current).toBe('1')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('2')
  })

  it('resets the timer when the value changes quickly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 400),
      { initialProps: { value: '1' } },
    )

    rerender({ value: '2' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({ value: '3' })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('1')

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe('3')
  })
})
