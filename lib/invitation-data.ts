const CLIENT_TTL_MS = 30_000
const REQUEST_TIMEOUT_MS = 15_000
const MAX_ATTEMPTS = 3
const STORAGE_PREFIX = "invitation-data:"

const jsonCache = new Map<string, { data: unknown[]; at: number }>()
const inflight = new Map<string, Promise<unknown[]>>()

export function prefetchInvitationData({
  sponsorsList,
  entourage = true,
}: { sponsorsList?: "one" | "two"; entourage?: boolean } = {}) {
  const urls: string[] = entourage
    ? [
        "/api/guests",
        "/api/entourage",
        sponsorsList ? `/api/principal-sponsor?list=${sponsorsList}` : "/api/principal-sponsor",
      ]
    : ["/api/guests"]
  for (const url of urls) {
    void fetchInvitationList(url).catch(() => undefined)
  }
  void import("@/components/sections/guest-list")
}

export function invalidateInvitationData(url?: string) {
  if (url) {
    jsonCache.delete(url)
    inflight.delete(url)
    return
  }
  jsonCache.clear()
  inflight.clear()
}

function abortError() {
  return new DOMException("Aborted", "AbortError")
}

function readStored(url: string): unknown[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + url)
    if (!raw) return null
    const data: unknown = JSON.parse(raw)
    return Array.isArray(data) && data.length > 0 ? data : null
  } catch {
    return null
  }
}

function writeStored(url: string, data: unknown[]) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + url, JSON.stringify(data))
  } catch {
    // storage full or blocked — memory cache still works
  }
}

/**
 * Last known good list (memory, then localStorage), regardless of age.
 * Lets sections render instantly while a fresh copy loads.
 */
export function readCachedInvitationList<T>(url: string): T[] | null {
  const cached = jsonCache.get(url)
  if (cached && cached.data.length > 0) return cached.data as T[]
  if (typeof window === "undefined") return null
  const stored = readStored(url)
  if (stored) jsonCache.set(url, { data: stored, at: 0 })
  return stored as T[] | null
}

async function requestList(url: string): Promise<unknown[]> {
  let lastError: unknown

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
      const data: unknown = await response.json().catch(() => null)
      if (response.ok && Array.isArray(data)) {
        if (data.length > 0) {
          jsonCache.set(url, { data, at: Date.now() })
          writeStored(url, data)
        }
        return data
      }
      lastError = new Error(`API list is not ready (${response.status})`)
    } catch (error) {
      lastError = error
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)))
    }
  }

  throw lastError instanceof Error ? lastError : new Error("API list is not ready")
}

/** Resolve with the shared request, but let each caller abort only its own wait. */
function withCallerSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  if (signal.aborted) return Promise.reject(abortError())
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError())
    signal.addEventListener("abort", onAbort, { once: true })
    promise.then(
      (value) => {
        signal.removeEventListener("abort", onAbort)
        resolve(value)
      },
      (error) => {
        signal.removeEventListener("abort", onAbort)
        reject(error)
      },
    )
  })
}

/**
 * Fetch a list endpoint with timeout + bounded retries. Concurrent callers share
 * one request. If the network fails, falls back to the last known good copy.
 */
export async function fetchInvitationList<T>(
  url: string,
  options?: { signal?: AbortSignal; reload?: boolean },
): Promise<T[]> {
  if (options?.signal?.aborted) throw abortError()

  if (!options?.reload) {
    const cached = jsonCache.get(url)
    if (cached && Date.now() - cached.at < CLIENT_TTL_MS && cached.data.length > 0) {
      return cached.data as T[]
    }
  }

  let request = options?.reload ? undefined : inflight.get(url)
  if (!request) {
    request = requestList(url).finally(() => {
      if (inflight.get(url) === request) inflight.delete(url)
    })
    inflight.set(url, request)
  }

  try {
    return (await withCallerSignal(request, options?.signal)) as T[]
  } catch (error) {
    if (options?.signal?.aborted) throw error
    const fallback = readCachedInvitationList<T>(url)
    if (fallback) return fallback
    throw error
  }
}
