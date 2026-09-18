type ResourceStatus = 'idle' | 'loading' | 'loaded' | 'failed'

interface RegistryEntry {
  status: ResourceStatus
  promise?: Promise<void>
  error?: unknown
}

const registry = new Map<string, RegistryEntry>()

function getEntry(key: string): RegistryEntry {
  const existing = registry.get(key)
  if (existing) return existing
  const entry: RegistryEntry = { status: 'idle' }
  registry.set(key, entry)
  return entry
}

export function hasResource(key: string) {
  return registry.get(key)?.status === 'loaded'
}

export function getResourceStatus(key: string): ResourceStatus {
  return registry.get(key)?.status || 'idle'
}

export function loadStylesheet(href: string, key = href): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()

  const entry = getEntry(key)
  if (entry.status === 'loaded') return Promise.resolve()
  if (entry.promise) return entry.promise

  entry.status = 'loading'
  entry.promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLLinkElement>(`link[data-orca-resource="${key}"]`)
    if (existing) {
      entry.status = 'loaded'
      resolve()
      return
    }

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.dataset.orcaResource = key
    link.onload = () => {
      entry.status = 'loaded'
      resolve()
    }
    link.onerror = (error) => {
      entry.status = 'failed'
      entry.error = error
      reject(error)
    }
    document.head.appendChild(link)
  })

  return entry.promise
}

export function loadScript(src: string, key = src, options: { ordered?: boolean } = {}): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()

  const entry = getEntry(key)
  if (entry.status === 'loaded') return Promise.resolve()
  if (entry.promise) return entry.promise

  entry.status = 'loading'
  entry.promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-orca-resource="${key}"]`)
    if (existing) {
      entry.status = 'loaded'
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = !options.ordered
    script.defer = true
    script.dataset.orcaResource = key
    script.onload = () => {
      entry.status = 'loaded'
      resolve()
    }
    script.onerror = (error) => {
      entry.status = 'failed'
      entry.error = error
      reject(error)
    }
    document.head.appendChild(script)
  })

  return entry.promise
}

export async function loadScriptsInOrder(resources: Array<{ src: string; key?: string }>) {
  for (const resource of resources) {
    await loadScript(resource.src, resource.key || resource.src, { ordered: true })
  }
}
