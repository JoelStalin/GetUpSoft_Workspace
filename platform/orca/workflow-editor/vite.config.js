import * as http from 'node:http'
import * as https from 'node:https'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * Direct IPv4 proxy plugin.
 *
 * Bypasses Vite's built-in http-proxy which triggers Node 24 Happy Eyeballs
 * (AggregateError [ECONNREFUSED] via internalConnectMultiple) even for
 * explicit 127.0.0.1 targets — the bundled http-proxy ignores custom agents.
 *
 * This plugin uses http.request with family:4 directly for guaranteed IPv4.
 */
function directProxyPlugin(apiBase, odooBase) {
  return {
    name: 'direct-ipv4-proxy',
    configureServer(server) {
      process.stderr.write(`[direct-proxy] plugin LOADED — api=${apiBase} odoo=${odooBase}\n`)
      server.middlewares.use((req, res, next) => {
        let targetBase = null
        let rewritePath = (p) => p

        if (req.url?.startsWith('/api')) {
          targetBase = apiBase
        } else if (req.url?.startsWith('/odoo') || req.url?.startsWith('/web') ||
                   req.url?.startsWith('/report') || req.url?.startsWith('/mail') ||
                   req.url?.startsWith('/bus') || req.url?.startsWith('/websocket') ||
                   req.url?.startsWith('/partner_autocomplete')) {
          targetBase = odooBase
        }

        if (!targetBase) return next()

        const parsed = new URL(targetBase)
        const targetHost = parsed.hostname  // 127.0.0.1 — already normalized
        const targetPort = parsed.port ? parseInt(parsed.port) : (parsed.protocol === 'https:' ? 443 : 80)
        const outPath = rewritePath(req.url)

        const mod = parsed.protocol === 'https:' ? https : http

        process.stderr.write(`[direct-proxy] ${req.method} ${req.url} -> ${targetHost}:${targetPort}${outPath}\n`)

        const proxyReq = mod.request(
          {
            hostname: targetHost,
            port: targetPort,
            path: outPath,
            method: req.method,
            headers: { ...req.headers, host: `${targetHost}:${targetPort}` },
            family: 4,  // Force IPv4 — bypass Node 24 Happy Eyeballs (internalConnectMultiple)
          },
          (proxyRes) => {
            // Strip Odoo frame-blocking headers so iframe works in ORCA canvas
            delete proxyRes.headers['x-frame-options']
            delete proxyRes.headers['content-security-policy']
            res.writeHead(proxyRes.statusCode, proxyRes.headers)
            proxyRes.pipe(res, { end: true })
          }
        )

        proxyReq.on('error', (err) => {
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
      // No built-in proxy — directProxyPlugin handles /api and /odoo/* with family:4 (IPv4-only)
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
    },
  }
})
