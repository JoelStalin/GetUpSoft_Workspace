const LIVE_API_STORAGE_KEY = 'orca:use-live-api'

function envValue(name: string) {
  return (import.meta.env[name as keyof ImportMetaEnv] as string | undefined) ?? undefined
}

function trimTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function isLiveApiEnabled() {
  const configuredDefault = envValue('VITE_ORCA_LIVE_API') !== 'false'

  try {
    const stored = window.localStorage.getItem(LIVE_API_STORAGE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
  } catch {
    return configuredDefault
  }

  return configuredDefault
}

export function getLiveApiStorageKey() {
  return LIVE_API_STORAGE_KEY
}

export function getApiOrigin() {
  const configured = envValue('VITE_API_URL') || envValue('API_URL')
  return configured ? trimTrailingSlash(configured) : ''
}

export function getApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const origin = getApiOrigin()
  return origin ? `${origin}${normalizedPath}` : normalizedPath
}
