import http from 'http'
import https from 'https'
import { URL } from 'url'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const port = process.env.PORT || 3000
const apiUrl = process.env.API_URL || process.env.VITE_API_URL || 'http://127.0.0.1:8788'
const odooUrl = process.env.ODOO_URL || process.env.VITE_ODOO_URL || 'http://127.0.0.1:8069'
const distDir = path.join(__dirname, 'dist')

// Simple proxy implementation
function proxyRequest(req, targetUrl, onResponse) {
  const targetUrlObj = new URL(targetUrl)
  const options = {
    hostname: targetUrlObj.hostname,
    port: targetUrlObj.port || (targetUrlObj.protocol === 'https:' ? 443 : 80),
    path: targetUrlObj.pathname + targetUrlObj.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: targetUrlObj.hostname,
    },
  }

  const proxyClient = targetUrlObj.protocol === 'https:' ? https : http
  const proxyReq = proxyClient.request(options, (proxyRes) => {
    // Remove frame blocking headers from Odoo
    delete proxyRes.headers['x-frame-options']
    delete proxyRes.headers['content-security-policy']
    onResponse(proxyRes)
  })

  req.pipe(proxyReq)
  proxyReq.on('error', (err) => console.error('Proxy error:', err))
}

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  // Handle API proxy
  if (url.pathname.startsWith('/api')) {
    const targetUrl = `${apiUrl}${url.pathname}${url.search}`
    proxyRequest(req, targetUrl, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    })
    return
  }

  // Handle Odoo proxy routes
  const odooRoutes = ['/web', '/report', '/odoo', '/websocket', '/mail', '/partner_autocomplete', '/bus']
  if (odooRoutes.some((route) => url.pathname.startsWith(route))) {
    const targetUrl = `${odooUrl}${url.pathname}${url.search}`
    proxyRequest(req, targetUrl, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res)
    })
    return
  }

  // Serve static files
  let filePath = path.join(distDir, url.pathname === '/' ? 'index.html' : url.pathname)

  // Prevent directory traversal
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('Forbidden')
    return
  }

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath)
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': contentType })
    fs.createReadStream(filePath).pipe(res)
  } else {
    // SPA fallback - serve index.html
    const indexPath = path.join(distDir, 'index.html')
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      fs.createReadStream(indexPath).pipe(res)
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    }
  }
})

server.listen(port, () => {
  console.log(`🚀 ORCA Workflow Editor running at http://localhost:${port}`)
  console.log(`📡 API Proxy: ${apiUrl}`)
  console.log(`🔧 Odoo Proxy: ${odooUrl}`)
  console.log(`📁 Serving from: ${distDir}`)
})
