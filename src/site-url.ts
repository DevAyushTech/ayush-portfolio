/** The canonical origin must be supplied by the owner, never guessed from a social URL. */
export function normalizeSiteUrl(value: string): string {
  if (!value.trim()) return ''
  const url = new URL(value.trim())
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/' || !url.hostname.includes('.') ||
      /(^|\.)(example|localhost)$/.test(url.hostname) ||
      /(^|\.)example\.(com|net|org)$/.test(url.hostname)) {
    throw new Error('VITE_SITE_URL must be the actual HTTPS portfolio origin, without a path, query, credentials, or example domain.')
  }
  return url.origin
}
