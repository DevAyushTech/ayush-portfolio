import { useEffect, useState } from 'react'
import { ExternalLink, GitBranch, RotateCw, Star } from 'lucide-react'
import { SocialIcon, SocialLinks } from './SocialLinks'
import './github.css'

type Props = { username: string; profileUrl: string; pinnedRepositories: string[] }
type Repo = { name: string; html_url: string; description: string | null; stargazers_count: number; forks_count: number; language: string | null; updated_at: string }
type EventItem = { type: string; repo?: { name: string }; created_at: string }
const usernamePattern = /^[a-zA-Z0-9-]{1,39}$/

function validProfile(url: string, username: string) {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' && parsed.hostname === 'github.com' && usernamePattern.test(username) } catch { return false }
}

export function GitHubSection({ username, profileUrl, pinnedRepositories }: Props) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [error, setError] = useState('')
  const configured = usernamePattern.test(username) && validProfile(profileUrl, username)

  async function load() {
    if (!configured) return
    setState('loading'); setError('')
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 7000)
    try {
      const headers = { Accept: 'application/vnd.github+json' }
      const [repoResponse, eventResponse] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&direction=desc&per_page=6&type=owner`, { headers, signal: controller.signal }),
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=6`, { headers, signal: controller.signal }),
      ])
      if (!repoResponse.ok) throw new Error(repoResponse.status === 403 ? 'GitHub API rate limit reached.' : 'GitHub data is temporarily unavailable.')
      const nextRepos = await repoResponse.json() as Repo[]
      const nextEvents = eventResponse.ok ? await eventResponse.json() as EventItem[] : []
      setRepos(nextRepos.filter((repo) => repo.html_url).slice(0, 6)); setEvents(nextEvents.slice(0, 4)); setState('ready')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'GitHub data is temporarily unavailable.'); setState('error')
    } finally { window.clearTimeout(timeout) }
  }

  useEffect(() => { if (configured) void load() }, [configured, username])

  return <section className="github-section section-pad" id="github"><div className="github-heading"><div><span className="eyebrow"><SocialIcon platform="github" size={14} /> OPEN SOURCE / GITHUB</span><h2>Code in<br /><em>public.</em></h2></div><p>Follow my code on GitHub, connect on LinkedIn, or find a little of life beyond code on Instagram. Repository details below come directly from GitHub’s public API.</p></div>
    <SocialLinks className="github-socials" email />
    {!configured ? <div className="github-empty"><div className="github-empty-mark"><SocialIcon platform="github" size={31} /></div><div><span className="modal-label">PROFILE CONNECTION PENDING</span><h3>Add the verified GitHub username in <code>src/data.ts</code>.</h3><p>This section will then show public repositories, languages, stars, forks, and recent public events from GitHub’s public API.</p></div></div> : <>
      <div className="github-toolbar"><a href={profileUrl} target="_blank" rel="noreferrer">@{username} <ExternalLink size={14} /></a><span aria-live="polite">{state === 'loading' ? 'Loading public data…' : state === 'error' ? error : `${repos.length} recent repositories`}</span>{state === 'error' && <button onClick={() => void load()}><RotateCw size={14} /> Retry</button>}</div>
      {state === 'loading' && <div className="github-loading" aria-label="Loading GitHub data">Fetching public repositories<span /><span /><span /></div>}
      {state === 'error' && <div className="github-error">GitHub did not return usable public data. The profile link remains available above.</div>}
      {state === 'ready' && <div className="github-repo-grid">{repos.map(repo => <a className="github-repo" key={repo.html_url} href={repo.html_url} target="_blank" rel="noreferrer"><div><span>{repo.language || 'Repository'}</span><ExternalLink size={14} /></div><h3>{repo.name}</h3><p>{repo.description || 'No repository description published yet.'}</p><footer><span><Star size={13} /> {repo.stargazers_count}</span><span><GitBranch size={13} /> {repo.forks_count}</span><time dateTime={repo.updated_at}>Updated {new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</time></footer></a>)}</div>}
      {state === 'ready' && <div className="github-activity"><span className="modal-label">RECENT PUBLIC ACTIVITY</span>{events.length ? events.map((event, index) => <div key={`${event.created_at}-${index}`}><span>{new Date(event.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span><strong>{event.type.replace('Event', ' activity')}</strong><em>{event.repo?.name || 'Public profile event'}</em></div>) : <p>No recent public events returned by GitHub.</p>}</div>}
    </>}
    <div className="github-footnote"><span>GitHub’s unauthenticated API does not expose a reliable contributions heatmap or pinned repository list.</span>{configured && <span>Curated repositories: {pinnedRepositories.length || 'not configured'}</span>}</div>
  </section>
}

export default GitHubSection
