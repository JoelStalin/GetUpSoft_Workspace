import * as http from 'node:http'
import * as https from 'node:https'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * Direct IPv4 proxy plugin.
 *
 * Bypasses Vite's built-in http-proxy which triggers Node 24 Happy Eyeballs
 * (AggregateError [ECONNREFUSED] via internalConnectMultiple) even for
 * explicit 127.0.0.1 targets because the bundled http-proxy ignores the
 * custom agent's family:4 setting.
 *
 * This plugin uses http.request with family:4 directly, guaranteed to use IPv4.
 */
function directProxyPlugin(apiBase: string, odooBase: string) {
  return {
    name: 'direct-ipv4-proxy',
    configureServer(server: any) {
      process.stderr.write('[direct-proxy] plugin LOADED — intercepting /api and /odoo\n')
      server.middlewares.use((req: any, res: any, next: () => void) => {
        if (req.url?.startsWith('/api') || req.url?.startsWith('/odoo')) {
          process.stderr.write(`[direct-proxy] INTERCEPTED: ${req.method} ${req.url}\n`)
        }
        let targetBase: string | null = null
        let rewritePath = (p: string) => p

        if (req.url?.startsWith('/api')) {
          targetBase = apiBase
        } else if (req.url?.startsWith('/odoo')) {
          targetBase = odooBase
          rewritePath = (p: string) => p.replace(/^\/odoo/, '') || '/'
        }

        if (!targetBase) return next()

        const parsed = new URL(targetBase)
        const targetHost = parsed.hostname
        const targetPort = parsed.port ? parseInt(parsed.port) : (parsed.protocol === 'https:' ? 443 : 80)
        const outPath = rewritePath(req.url)

        const isHttps = parsed.protocol === 'https:'
        const mod: typeof http | typeof https = isHttps ? https : http

        const proxyReq = mod.request(
          {
            hostname: targetHost,
            port: targetPort,
            path: outPath,
            method: req.method,
            headers: { ...req.headers, host: `${targetHost}:${targetPort}` },
            family: 4 as any, // Force IPv4 — Node 24 Happy Eyeballs fix
          } as any,
          (proxyRes: any) => {
            // Strip Odoo frame-blocking headers so iframe works in ORCA canvas
            delete proxyRes.headers['x-frame-options']
            delete proxyRes.headers['content-security-policy']
            res.writeHead(proxyRes.statusCode, proxyRes.headers)
            proxyRes.pipe(res, { end: true })
          }
        )

        proxyReq.on('error', (err: Error) => {
          process.stderr.write(`[direct-proxy] ERR ${targetBase}${outPath}: ${err.message}\n`)
          if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Proxy error', detail: err.message }))
        })

        req.pipe(proxyReq, { end: true })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL || env.API_URL || 'http://127.0.0.1:8788'
  const odooTarget = env.VITE_ODOO_URL || env.ODOO_URL || 'http://127.0.0.1:8069'

  return {
    plugins: [react(), directProxyPlugin(apiTarget, odooTarget)],
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
  }
})
