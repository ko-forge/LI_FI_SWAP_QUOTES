import { afterEach, describe, expect, it, vi } from 'vitest'
import { LIFI_API_BASE_URL, LifiApiError, lifiFetch } from './client'

describe('LifiApiError', () => {
  it('prefers body.message, then joined errors, then the fallback', () => {
    expect(new LifiApiError(400, { message: 'bad quote' }, 'fallback').message).toBe(
      'bad quote',
    )
    expect(
      new LifiApiError(
        400,
        { errors: [{ message: 'missing amount' }, { message: 'bad token' }] },
        'fallback',
      ).message,
    ).toBe('missing amount; bad token')
    expect(new LifiApiError(500, null, 'fallback').message).toBe('fallback')
  })
})

describe('lifiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('requests the LI.FI URL with query params and Accept header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await lifiFetch('/tokens', {
      chains: 1,
      unused: undefined,
      empty: '',
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]!
    expect(String(url)).toBe(`${LIFI_API_BASE_URL}/tokens?chains=1`)
    expect(init).toMatchObject({
      headers: {
        Accept: 'application/json',
      },
    })
  })

  it('returns JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ chains: [] }),
      }),
    )

    await expect(lifiFetch('/chains')).resolves.toEqual({ chains: [] })
  })

  it('throws LifiApiError on non-OK responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'querystring must have required property' }),
      }),
    )

    await expect(lifiFetch('/quote')).rejects.toMatchObject({
      name: 'LifiApiError',
      status: 400,
      message: 'querystring must have required property',
    })
  })

  it('falls back when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error('invalid json')
        },
      }),
    )

    await expect(lifiFetch('/chains')).rejects.toMatchObject({
      status: 502,
      message: 'LI.FI request failed (502)',
    })
  })
})
