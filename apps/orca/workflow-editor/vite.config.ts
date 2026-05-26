import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const stripFrameBlockingHeaders = (proxy: any) => {
  proxy.on('proxyRes', (proxyRes: any) => {
    delete proxyRes.headers['x-frame-options']
    delete proxyRes.headers['content-security-policy']
  })
}

const odooProxy = {
  target: 'http://localhost:8069',
  changeOrigin: true,
  configure: stripFrameBlockingHeaders,
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8015',
        changeOrigin: true,
      },
      '/web': odooProxy,
      '/report': odooProxy,
      '/odoo': odooProxy,
      '/websocket': odooProxy,
      '/mail': odooProxy,
      '/partner_autocomplete': odooProxy,
      '/bus': odooProxy,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
