import { absoluteUrl, hackathons, isRealHttpUrl, journal, personJsonLd, profile, projects, SITE_URL, type Project } from './data'

export type PageMeta = {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  noindex?: boolean
  article?: { headline: string; datePublished: string; readingTime: string }
}

export const pageMeta: Record<string, PageMeta> = {
  '/': {
    title: 'Ayush Kumar Singh | AI/ML Developer & CSE Student',
    description: `${profile.name}, also known as ${profile.alternateName}, is a Computer Science & Engineering student specializing in Artificial Intelligence & Machine Learning, building AI, full-stack and experimental technology projects.`,
    path: '/',
  },
  '/about': { title: 'About Ayush Kumar Singh | AI/ML & Full-Stack Builder', description: `Learn about ${profile.name}, also known as ${profile.alternateName}, a CSE student in West Bengal building AI/ML, full-stack, and experimental technology projects.`, path: '/about' },
  '/projects': { title: 'Projects by Ayush Kumar Singh | AI, Full-Stack & Experimental Systems', description: 'Explore Auto Escrow, SatQuery AI, OrbitRakshak, GhostAudit AI, VerifyX, BloomLink, and other honest project explorations by Ayush Kumar Singh.', path: '/projects' },
  '/journey': { title: 'Journey | Ayush Kumar Singh — CSE, AI/ML & Developer', description: 'The learning journey of Ayush Kumar Singh through B.Tech CSE, AI/ML exploration, full-stack development, hackathons, geospatial AI, and blockchain experiments.', path: '/journey' },
  '/hackathons': { title: 'Hackathons & Innovation | Ayush Kumar Singh', description: 'A project-led look at hackathon and innovation explorations by Ayush Kumar Singh across AI/ML, satellite imagery, orbital data, and backend systems.', path: '/hackathons' },
  '/writing': { title: 'Engineering Journal | Ayush Kumar Singh', description: 'Notes and future technical writing topics from Ayush Kumar Singh on AI/ML learning, hackathon building, and practical software engineering.', path: '/writing' },
  '/contact': { title: 'Contact Ayush Kumar Singh | AI/ML & Full-Stack Developer', description: 'Connect with Ayush Kumar Singh about thoughtful software problems, AI/ML projects, full-stack experiments, and collaboration.', path: '/contact' },
  '/resume': { title: 'Resume | Ayush Kumar Singh', description: 'Resume and professional profile for Ayush Kumar Singh, B.Tech CSE student specializing in Artificial Intelligence & Machine Learning.', path: '/resume' },
}

export const projectMeta = (project: Project): PageMeta => ({
  title: `${project.name} | Ayush Kumar Singh — Project Case Study`,
  description: `${project.description} Read the problem, approach, architecture, technology, and current status.`,
  path: `/projects/${project.id}`,
})

export function getMeta(pathname: string): PageMeta {
  if (pageMeta[pathname]) return pageMeta[pathname]
  const project = projects.find((item) => pathname === `/projects/${item.id}`)
  if (project) return projectMeta(project)
  return { title: 'Page not found | Ayush Kumar Singh', description: 'This page does not exist in Ayush Kumar Singh’s digital system.', path: pathname, noindex: true }
}

export function getStructuredData(pathname: string): Record<string, unknown>[] {
  const meta = getMeta(pathname)
  const person = personJsonLd()
  const website = { '@type': 'WebSite', '@id': absoluteUrl('/#website'), url: absoluteUrl('/'), name: 'Ayush Kumar Singh — Digital System', publisher: { '@id': absoluteUrl('/#person') } }
  const profilePage = { '@type': 'ProfilePage', '@id': absoluteUrl('/#profile'), url: absoluteUrl('/'), mainEntity: { '@id': absoluteUrl('/#person') }, name: 'Ayush Kumar Singh — Digital System' }
  const breadcrumb = { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') }, ...(pathname !== '/' ? [{ '@type': 'ListItem', position: 2, name: meta.title.split(' | ')[0], item: absoluteUrl(pathname) }] : [])] }
  const project = projects.find((item) => pathname === `/projects/${item.id}`)
  const article = meta.article
  const creative = project ? { '@type': 'CreativeWork', '@id': absoluteUrl(pathname), name: project.name, description: project.description, url: absoluteUrl(pathname), author: { '@id': absoluteUrl('/#person') }, keywords: project.stack.join(', '), genre: project.category } : null
  const articleSchema = article ? { '@type': 'Article', '@id': absoluteUrl(pathname), headline: article.headline, description: meta.description, datePublished: article.datePublished, timeRequired: article.readingTime, author: { '@id': absoluteUrl('/#person') }, mainEntityOfPage: absoluteUrl(pathname) } : null
  return [person, website, profilePage, breadcrumb, ...(creative ? [creative] : []), ...(articleSchema ? [articleSchema] : [])]
}

export function metaHead(pathname: string): string {
  const meta = getMeta(pathname)
  const canonical = absoluteUrl(meta.path)
  const graph = getStructuredData(pathname)
  const noindex = meta.noindex || !SITE_URL
  const image = SITE_URL ? absoluteUrl('/og-image.png') : '/og-image.png'
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}">`,
    `<meta name="author" content="${escapeAttr(profile.name)}">`,
    `<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow'}">`,
    `<link rel="canonical" href="${escapeAttr(canonical)}">`,
    `<meta property="og:type" content="${meta.type || (meta.article ? 'article' : 'website')}">`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}">`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}">`,
    `<meta property="og:url" content="${escapeAttr(canonical)}">`,
    `<meta property="og:image" content="${escapeAttr(image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}">`,
    `<meta name="twitter:image" content="${escapeAttr(image)}">`,
    `<script type="application/ld+json" id="identity-schema">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

/** Keep the canonical, social cards and schema in sync on client-side route changes. */
export function applyPageMeta(pathname: string) {
  const template = document.createElement('template')
  template.innerHTML = metaHead(pathname)
  for (const node of Array.from(template.content.children)) {
    const key = node.getAttribute('name') || node.getAttribute('property')
    const selector = node.tagName === 'TITLE' ? 'title'
      : node.tagName === 'LINK' ? 'link[rel="canonical"]'
      : node.tagName === 'SCRIPT' ? '#identity-schema'
      : `meta[${node.hasAttribute('name') ? 'name' : 'property'}="${key}"]`
    const existing = document.head.querySelector(selector)
    if (existing) existing.replaceWith(node)
    else document.head.append(node)
  }
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || character) }
function escapeAttr(value: string) { return escapeHtml(value) }

export const writingTopics = journal
export const innovationProjects = hackathons
export const validSocials = Object.entries(profile.socials).filter(([, url]) => isRealHttpUrl(url))
