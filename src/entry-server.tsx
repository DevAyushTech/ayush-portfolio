import { renderToString } from 'react-dom/server'
import App from './App'
import { profile, projects, SITE_URL } from './data'
import { getMeta, metaHead } from './seo'

export const paths = [
  '/', '/about', '/projects',
  ...projects.map((project) => `/projects/${project.id}`),
  '/journey', '/hackathons', '/writing', '/contact', '/resume',
]

export const siteUrl = SITE_URL
export const resumeUrl = profile.resumeUrl

export function render(pathname: string) {
  const safePath = paths.includes(pathname) ? pathname : '/404'
  const html = renderToString(<App initialPath={safePath} />)
  const meta = getMeta(pathname)
  return { html, head: metaHead(pathname), title: meta.title }
}
