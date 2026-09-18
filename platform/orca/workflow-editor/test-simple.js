import http from 'http'

const options = {
  hostname: 'localhost',
  port: 5173,
  path: '/',
  method: 'GET',
  timeout: 5000,
}

console.log('Testing server connection...')

const req = http.request(options, (res) => {
  console.log(`✓ Server responded with status: ${res.statusCode}`)

  let html = ''
  res.on('data', (chunk) => {
    html += chunk.toString()
  })

  res.on('end', () => {
    console.log(`✓ Received ${html.length} bytes of HTML`)

    // Check for specific elements
    const hasReactRoot = html.includes('id="root"')
    const hasCanvas = html.includes('canvas') || html.includes('ReactFlow')
    const hasApp = html.includes('<script') || html.includes('main.tsx')

    console.log(`✓ Has React root: ${hasReactRoot}`)
    console.log(`✓ Has canvas/ReactFlow: ${hasCanvas}`)
    console.log(`✓ Has app script: ${hasApp}`)

    if (hasReactRoot) {
      console.log('\n✅ Server is working and serving HTML with React root!')
    }
  })
})

req.on('error', (error) => {
  console.error(`❌ Connection error: ${error.message}`)
})

req.on('timeout', () => {
  console.error('❌ Request timeout')
  req.destroy()
})

req.end()
