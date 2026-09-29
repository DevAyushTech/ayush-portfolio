import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const renderer = await import(pathToFileURL(path.join(root, '.ssr', 'entry-server.js')).href)
const paths = renderer.paths || ['/']
const siteUrl = renderer.siteUrl
const configured = Boolean(siteUrl)
const realSocials = [
  'https://github.com/DevAyushTech',
  'https://www.linkedin.com/in/connect-ayushsingh/',
  'https://www.instagram.com/be.aayushh/',
]
const emailHref = 'mailto:connect.ayushkumarsingh@gmail.com'
let resumePending = false
const htmlFiles = new Map()
for (const pathname of paths) {
  const file = pathname === '/' ? path.join(dist, 'index.html') : path.join(dist, pathname.slice(1), 'index.html')
  const html = await fs.readFile(file, 'utf8')
  htmlFiles.set(pathname, html)
}
const notFound = await fs.readFile(path.join(dist, '404.html'), 'utf8')
const titles = new Set()
const localReferences = new Set()

for (const [pathname, html] of htmlFiles) {
  const title = match(html, /<title>([^<]+)<\/title>/i)
  const description = match(html, /<meta name="description" content="([^"]+)"/i)
  const canonical = match(html, /<link rel="canonical" href="([^"]+)"/i)
  const robots = match(html, /<meta name="robots" content="([^"]+)"/i)
  const h1s = [...html.matchAll(/<h1\b/gi)]
  assert(title, `${pathname}: missing title`)
  assert(description, `${pathname}: missing description`)
  assert(canonical, `${pathname}: missing canonical`)
  assert.equal(h1s.length, 1, `${pathname}: expected one h1, found ${h1s.length}`)
  assert.equal(canonical, `${siteUrl}${pathname}`, `${pathname}: incorrect canonical`)
  const schema = JSON.parse(match(html, /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i))
  const person = schema['@graph'].find(entity => entity['@type'] === 'Person')
  assert.equal(person.name, 'Ayush Kumar Singh')
  assert.equal(person.alternateName, 'Ayush Singh')
  assert.equal(person.url, `${siteUrl}/`)
  assert.deepEqual(person.sameAs, realSocials)
  assert(schema['@graph'].some(entity => entity['@type'] === 'BreadcrumbList'))
  assert.equal(html.includes('"@type":"Article"'), false, 'Unpublished writing topics must not claim Article schema')
  for (const url of realSocials) assert(html.includes(`href="${url}"`), `${pathname}: missing real profile link`)
  assert(html.includes(`href="${emailHref}"`), `${pathname}: missing professional email`)
  assert(html.includes(`property="og:url" content="${canonical}"`), `${pathname}: wrong OG URL`)
  assert(html.includes('application/ld+json'), `${pathname}: missing JSON-LD`)
  assert(html.includes('"@type":"Person"'), `${pathname}: missing Person schema`)
  assert(html.includes('"@type":"WebSite"'), `${pathname}: missing WebSite schema`)
  assert(html.includes('"@type":"ProfilePage"'), `${pathname}: missing ProfilePage schema`)
  assert(!html.includes('your-domain.example') && !html.includes('ayushkumarsingh.dev'), `${pathname}: invented/example domain found`)
  assert.equal(robots.includes('noindex'), !configured, `${pathname}: robots mismatch for configured site state`)
  assert(!titles.has(title), `duplicate title: ${title}`)
  titles.add(title)
  for (const matchResult of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const ref = matchResult[1]
    if (ref.startsWith('/') && !ref.startsWith('//') && !ref.startsWith('/#')) localReferences.add(ref.split('#')[0].split('?')[0])
    assert(ref !== '', `${pathname}: empty URL attribute`)
  }
}
for (const reference of localReferences) {
  if (reference === '/') continue
  if (reference === '/resume.pdf') {
    try {
      const pdf = await fs.readFile(path.join(dist, 'resume.pdf'))
      assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', 'Resume must be a PDF, not an HTML fallback or placeholder')
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
      resumePending = true
      assert(htmlFiles.get('/resume').includes('Resume PDF awaiting upload.'), 'Missing PDF must be disclosed')
    }
    continue
  }
  const asset = path.join(dist, reference.slice(1))
  const routeIndex = path.join(asset, 'index.html')
  try { await fs.access(asset) } catch {
    try { await fs.access(routeIndex) } catch { assert.fail(`missing local reference: ${reference}`) }
  }
}
assert(notFound.includes('noindex, nofollow'), '404 must be noindex')
for (const asset of ['favicon.svg', 'manifest.webmanifest', 'og-image.png']) await fs.access(path.join(dist, asset))
const robots = await fs.readFile(path.join(dist, 'robots.txt'), 'utf8')
assert(configured ? robots.includes('Allow: /') && robots.includes('Sitemap:') : robots.includes('Disallow: /'), 'robots.txt crawl state is incorrect')
const sitemap = await fs.readFile(path.join(dist, 'sitemap.xml'), 'utf8')
if (configured) for (const pathname of paths) assert(sitemap.includes(`${siteUrl.replace(/\/$/, '')}${pathname === '/' ? '/' : pathname}`), `sitemap missing ${pathname}`)
const home = htmlFiles.get('/')
assert(match(home, /<h1[^>]*>([\s\S]*?)<\/h1>/).includes('Ayush Kumar Singh'))
assert(home.includes('Also known as <!-- -->Ayush Singh') || home.includes('Also known as Ayush Singh'))
for (const route of ['/', '/resume']) {
  const html = htmlFiles.get(route)
  assert.match(html, /href="\/resume.pdf"[^>]*target="_blank"/)
  assert.match(html, /href="\/resume.pdf"[^>]*download="Ayush-Kumar-Singh-Resume.pdf"/)
  assert(html.includes('View Resume') && html.includes('Download Resume'))
}
console.log(`Site check passed: ${paths.length} routes, ${titles.size} unique titles, verified identity/social metadata, ${localReferences.size} local references checked.`)
if (resumePending) console.warn('PENDING OWNER FILE: /resume.pdf is a documented placeholder. Actual PDF availability and content cannot pass verification until supplied.')
if (!configured) console.warn('PENDING OWNER DOMAIN: local preview intentionally excludes indexing. Use build:production with the real VITE_SITE_URL for launch.')

function match(value, pattern) { return pattern.exec(value)?.[1] || '' }
