// Zero-dependency static file server for the production build (dist/).
// Avoids shipping/depending on node_modules at runtime - vite, react,
// jspdf etc. are only needed to build dist/, not to serve it, and relying
// on `vite preview` in production meant shipping the whole dev toolchain,
// including a node_modules/.bin symlink that doesn't survive every
// zip/unzip deployment pipeline intact (e.g. Azure's).
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')
const port = process.env.PORT || 4173

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  let filePath = path.join(distDir, urlPath)

  // Never serve outside dist/, and fall back to index.html for anything
  // that isn't a real file - this is a single-page app with no server-side
  // routes of its own.
  if (!filePath.startsWith(distDir)) filePath = path.join(distDir, 'index.html')

  fs.stat(filePath, (err, stats) => {
    if (err || stats.isDirectory()) filePath = path.join(distDir, 'index.html')
    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(404)
        res.end('Not found')
        return
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' })
      res.end(data)
    })
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving dist/ on port ${port}`)
})
