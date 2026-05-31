import * as http from 'node:http'
import * as https from 'node:https'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, ProxyOptions } from 'vite'

function normalizeProxyTarget(rawTarget: string) {
  const url = new URL(rawTarget)

  if (url.hostname === 'localhost') {
    url.hostname = '127.0.0.1'
  }

  return url.toString().replace(/\/$/, '')
}

function buildProxyOptions(target: string, overrides: Partial<ProxyOptions> = {}): ProxyOptions {
  const normalizedTarget = normalizeProxyTarget(target)
  const targetUrl = new URL(normalizedTarget)
  const agent =
    targetUrl.protocol === 'https:'
      ? new https.Agent({ family: 4, rejectUnauthorized: false })
      : new http.Agent({ family: 4 })

  const proxyOptions: ProxyOptions = {
    target: normalizedTarget,
    changeOrigin: true,
    secure: false,
    agent,
    configure(proxy) {
      proxy.on('error', (error, _req, res) => {
        console.error(`[vite-proxy] ${normalizedTarget}:`, error.message)

        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' })
        }

        res.end(`Proxy error: ${error.message}`)
      })
    },
    ...overrides,
  }

  return proxyOptions
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || env.API_URL || 'http://127.0.0.1:8788'
  const odooTarget = env.VITE_ODOO_URL || env.ODOO_URL || 'http://127.0.0.1:8069'

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': buildProxyOptions(apiTarget),
        '/odoo': buildProxyOptions(odooTarget, {
          rewrite: (path) => path.replace(/^\/odoo/, ''),
        }),
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
  }
})
