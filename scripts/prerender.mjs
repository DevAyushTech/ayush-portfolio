import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const templatePath = path.join(dist, 'index.html')
const template = await fs.readFile(templatePath, 'utf8')
const renderer = await import(pathToFileURL(path.join(root, '.ssr', 'entry-server.js')).href)
const paths = renderer.paths || ['/']
// Use Vite's resolved config (including .env.local), exactly like HTML metadata.
const siteUrl = renderer.siteUrl
const validSiteUrl = Boolean(siteUrl)

function renderDocument(pathname, result) {
  return template.replace('<!--app-head-->', result.head).replace('<!--app-html-->', result.html)
}

function outputFile(pathname) {
  return pathname === '/' ? path.join(dist, 'index.html') : path.join(dist, pathname.replace(/^\//, ''), 'index.html')
}

for (const pathname of paths) {
  const result = renderer.render(pathname)
  const file = outputFile(pathname)
  const document = renderDocument(pathname, result)
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, document)
  if (pathname !== '/') await fs.writeFile(path.join(dist, `${pathname.replace(/^\//, '')}.html`), document)
}

const notFound = renderer.render('/404')
await fs.writeFile(path.join(dist, '404.html'), renderDocument('/404', notFound))

const urls = validSiteUrl ? paths.map((pathname) => `  <url><loc>${siteUrl.replace(/\/$/, '')}${pathname === '/' ? '/' : pathname}</loc></url>`).join('\n') : '  <!-- Set VITE_SITE_URL to a real HTTPS domain to publish sitemap URLs. -->'
await fs.writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
await fs.writeFile(path.join(dist, 'robots.txt'), validSiteUrl ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n')

if (renderer.resumeUrl === '/resume.pdf') {
  try { await fs.access(path.join(dist, 'resume.pdf')) }
  catch { console.warn('ACTION REQUIRED: place your real PDF at public/resume.pdf and rebuild. Resume links are documented placeholders until then.') }
}
console.log(`Prerendered ${paths.length} routes${validSiteUrl ? ` for ${siteUrl}` : ' in safe local preview mode (no production domain supplied)'}.`)
if (!validSiteUrl) console.warn('Production launch: set VITE_SITE_URL to the deployed HTTPS origin and use npm run build:production to prevent accidental noindex.')
