const SUPABASE_URL = 'https://ajsguwoenolcdahguzjc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BOGmNbRLkcK5NTq38xtduA_GSCBuobp'

export type Achievement = {
  title: string
  organization?: string
  date?: string
  description?: string
  url?: string
}

export type PortfolioContent = {
  site?: import('./data').EditableSite
  announcement?: string
  achievements?: Achievement[]
  profile?: { bio?: string }
  [key: string]: unknown
}

export async function fetchPortfolioContent(): Promise<PortfolioContent> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/portfolio_content?id=eq.site&select=content`,
      { headers: { apikey: SUPABASE_KEY }, cache: 'no-store' },
    )
    if (!response.ok) return {}
    const rows = await response.json() as Array<{ content?: PortfolioContent }>
    return rows[0]?.content ?? {}
  } catch {
    return {}
  }
}
