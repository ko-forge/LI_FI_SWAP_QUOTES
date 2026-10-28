import type { LifiApiErrorBody } from './types'

export const LIFI_API_BASE_URL = 'https://li.quest/v1'

export class LifiApiError extends Error {
  readonly status: number
  readonly body: LifiApiErrorBody | null

  constructor(status: number, body: LifiApiErrorBody | null, fallbackMessage: string) {
    const message =
      body?.message ||
      body?.errors?.map((error) => error.message).filter(Boolean).join('; ') ||
      fallbackMessage

    super(message)
    this.name = 'LifiApiError'
    this.status = status
    this.body = body
  }
}

export async function lifiFetch<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
  init?: RequestInit,
): Promise<T> {
  const url = new URL(`${LIFI_API_BASE_URL}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  })

  const body = (await response.json().catch(() => null)) as T | LifiApiErrorBody | null

  if (!response.ok) {
    throw new LifiApiError(
      response.status,
      body as LifiApiErrorBody | null,
      `LI.FI request failed (${response.status})`,
    )
  }

  return body as T
}
