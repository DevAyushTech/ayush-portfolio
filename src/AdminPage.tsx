import { useEffect, useState } from 'react'
import './admin.css'
import { fetchPortfolioContent, type Achievement, type PortfolioContent } from './supabase-content'
import { getEditableSite, type EditableSite } from './data'

const SUPABASE_URL = 'https://ajsguwoenolcdahguzjc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BOGmNbRLkcK5NTq38xtduA_GSCBuobp'
const OWNER_EMAIL = 'connect.ayushkumarsingh@gmail.com'
const TOKEN_KEY = 'portfolio-admin-session'
const DEFAULT_AVATAR = '/avatar.jpg'

type AuthUser = { id: string; email?: string }
type Session = { access_token: string; refresh_token?: string; expires_at?: number; user: AuthUser }

async function authRequest(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || 'Authentication failed.')
  return data
}

async function refreshSession(current: Session): Promise<Session> {
  if (!current.refresh_token) throw new Error('Your session expired. Please sign in again.')
  const data = await authRequest('token?grant_type=refresh_token', { refresh_token: current.refresh_token })
  if (!data.access_token || data.user?.email?.toLowerCase() !== OWNER_EMAIL) throw new Error('Session refresh failed. Please sign in again.')
  const next = data as Session
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next))
  return next
}

function validImageUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch { return value.startsWith('/') && !value.startsWith('//') }
}

function prettySite(site: EditableSite) {
  return JSON.stringify(site, null, 2)
}

export default function AdminPage() {
  const [email, setEmail] = useState(OWNER_EMAIL)
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [content, setContent] = useState<PortfolioContent>({ announcement: '', achievements: [], profile: { bio: '' } })
  const [siteJson, setSiteJson] = useState(() => prettySite(getEditableSite()))
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    if (!stored) return
    try {
      const value = JSON.parse(stored) as Session
      if (value.user?.email?.toLowerCase() === OWNER_EMAIL) {
        if (value.expires_at && value.expires_at * 1000 < Date.now() + 60000) {
          void refreshSession(value).then(setSession).catch(() => { sessionStorage.removeItem(TOKEN_KEY) })
        } else setSession(value)
      }
    } catch { sessionStorage.removeItem(TOKEN_KEY) }
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchPortfolioContent().then((value) => {
      if (cancelled) return
      const site = value.site ?? getEditableSite()
      if (value.profile?.bio && site.profile) site.profile.bio = value.profile.bio
      setSiteJson(prettySite(site))
      setAvatarUrl(site.profile?.avatarUrl || DEFAULT_AVATAR)
      setContent({
        ...value,
        announcement: value.announcement ?? '',
        achievements: value.achievements ?? [],
        profile: { ...value.profile, bio: value.profile?.bio ?? site.profile?.bio ?? '' },
      })
    }).catch(() => { if (!cancelled) setStatus('Could not load saved content. You can still edit the default site data.') })
    return () => { cancelled = true }
  }, [session])

  async function login(signUp = false) {
    setBusy(true); setStatus('')
    try {
      if (email.trim().toLowerCase() !== OWNER_EMAIL) throw new Error('This admin account is restricted to the portfolio owner email.')
      const data = await authRequest(signUp ? `signup?redirect_to=${encodeURIComponent(window.location.origin + '/admin')}` : 'token?grant_type=password', { email: email.trim(), password })
      if (!data.access_token || !data.user) {
        setStatus('Account request submitted. Check your inbox and confirm the email address, then sign in.')
        return
      }
      if (data.user.email?.toLowerCase() !== OWNER_EMAIL) throw new Error('This account is not authorized.')
      const next = data as Session
      sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next))
      setSession(next)
      setStatus('Signed in securely.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sign in.')
    } finally { setBusy(false) }
  }

  function updateAchievement(index: number, field: keyof Achievement, value: string) {
    setContent((current) => ({
      ...current,
      achievements: (current.achievements ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }))
  }
  function addAchievement() { setContent((current) => ({ ...current, achievements: [...(current.achievements ?? []), { title: '' }] })) }
  function removeAchievement(index: number) { setContent((current) => ({ ...current, achievements: (current.achievements ?? []).filter((_, itemIndex) => itemIndex !== index) })) }

  function updateAvatar(value: string) {
    setAvatarUrl(value)
    try {
      const parsed = JSON.parse(siteJson) as EditableSite
      parsed.profile = { ...parsed.profile, avatarUrl: value }
      setSiteJson(prettySite(parsed))
    } catch { /* Keep the URL field usable while the JSON is being repaired. */ }
  }

  async function save() {
    if (!session) return
    let site: EditableSite
    try {
      const parsed = JSON.parse(siteJson)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The site content must be a JSON object.')
      site = parsed as EditableSite
      if (site.profile && typeof site.profile !== 'object') throw new Error('profile must be an object.')
      for (const key of ['projects', 'skillGroups', 'journey', 'journal', 'hackathons'] as const) {
        if (site[key] !== undefined && !Array.isArray(site[key])) throw new Error(`${key} must be an array.`)
      }
      if (!validImageUrl(avatarUrl.trim())) throw new Error('Avatar must be a valid http(s) image URL or a site path.')
      site.profile = { ...site.profile, avatarUrl: avatarUrl.trim(), avatarAlt: site.profile?.avatarAlt || 'Ayush Kumar Singh' }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Please fix the site JSON.')
      return
    }
    const achievements = content.achievements ?? []
    if (achievements.some((item) => !item.title.trim())) { setStatus('Add a title to each achievement or remove the empty item.'); return }
    for (const item of achievements) {
      if (item.url) {
        try { const url = new URL(item.url); if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error() }
        catch { setStatus('Achievement links must be valid http or https URLs.'); return }
      }
    }
    setBusy(true); setStatus('')
    try {
      let current = session
      if (current.expires_at && current.expires_at * 1000 < Date.now() + 60000) { current = await refreshSession(current); setSession(current) }
      const payload = { ...content, profile: { bio: site.profile?.bio ?? '' }, site, achievements }
      const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_content?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${current.access_token}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({ id: 'site', content: payload, updated_at: new Date().toISOString(), updated_by: current.user.id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || data.details || 'Save failed. Check your session and database policy.')
      setContent(payload)
      setSiteJson(prettySite(site))
      setStatus('Saved. Profile, projects, skills, journey, hackathons and notes will refresh on the public site within about 30 seconds.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save content.')
    } finally { setBusy(false) }
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setSession(null); setPassword(''); setStatus('Signed out.')
  }

  return <main className="admin-shell">
    <a className="admin-back" href="/">← Back to portfolio</a>
    <section className="admin-panel">
      <p className="admin-eyebrow">PORTFOLIO CMS / PRIVATE</p>
      <h1>{session ? 'Full content dashboard' : 'Admin sign in'}</h1>
      <p className="admin-intro">Edit the portfolio data without a redeploy. The dashboard includes profile/avatar, all project details, skills, journey, hackathons, journal entries, announcements and achievements.</p>
      {!session ? <form className="admin-auth" onSubmit={(event) => { event.preventDefault(); void login(false) }}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" /></label>
        <button className="admin-primary" disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}</button>
        <button className="admin-secondary" type="button" disabled={busy} onClick={() => void login(true)}>Create owner account</button>
        <p className="admin-help">Use the portfolio email. Confirm the email address before signing in; only the verified owner account can save content.</p>
      </form> : <>
        <div className="admin-session"><span>Signed in as {session.user.email}</span><button className="admin-secondary" onClick={logout}>Sign out</button></div>
        <div className="admin-editor">
          <label>Homepage announcement<textarea rows={3} value={content.announcement ?? ''} onChange={(event) => setContent((current) => ({ ...current, announcement: event.target.value }))} placeholder="A short update shown on the homepage" /></label>
          <div className="admin-avatar-editor">
            <label>Profile avatar image URL<input value={avatarUrl} onChange={(event) => updateAvatar(event.target.value)} placeholder="https://.../your-photo.jpg" /></label>
            <img src={avatarUrl || '/avatar.svg'} alt="Avatar preview" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/avatar.svg' }} />
            <p className="admin-help">Use a direct image URL (JPG, PNG, or WebP). Your GitHub profile avatar is prefilled; replace it with the exact photo you want.</p>
          </div>
          <div className="admin-achievements-head"><h2>All portfolio content</h2><button className="admin-secondary" type="button" onClick={() => { const fresh = getEditableSite(); setSiteJson(prettySite(fresh)); setAvatarUrl(fresh.profile?.avatarUrl || DEFAULT_AVATAR); setStatus('Loaded the default content into the editor. Save to publish it.') }}>Load default data</button></div>
          <label>Full site data — JSON editor<textarea className="admin-site-json" rows={26} spellCheck={false} value={siteJson} onChange={(event) => setSiteJson(event.target.value)} /></label>
          <p className="admin-help">Edit profile fields/socials, every project, skill groups, journey timeline, hackathons and journal notes here. To edit any fixed visible label or paragraph too, add it under textOverrides using the exact current text as the key and your replacement as the value, for example, map the exact current visible text to the replacement text inside the textOverrides object. Keep the JSON valid, then save.</p>
          <div className="admin-achievements-head"><h2>Achievements</h2><button className="admin-secondary" type="button" onClick={addAchievement}>+ Add achievement</button></div>
          {(content.achievements ?? []).map((item, index) => <article className="admin-achievement" key={index}>
            <div className="admin-achievement-title"><strong>Achievement {index + 1}</strong><button className="admin-remove" type="button" onClick={() => removeAchievement(index)}>Remove</button></div>
            <label>Title<input value={item.title} onChange={(event) => updateAchievement(index, 'title', event.target.value)} placeholder="Award or accomplishment" /></label>
            <div className="admin-fields-row"><label>Organization<input value={item.organization ?? ''} onChange={(event) => updateAchievement(index, 'organization', event.target.value)} placeholder="Event / organization" /></label><label>Date<input value={item.date ?? ''} onChange={(event) => updateAchievement(index, 'date', event.target.value)} placeholder="e.g. Nov 2026" /></label></div>
            <label>Description<textarea rows={3} value={item.description ?? ''} onChange={(event) => updateAchievement(index, 'description', event.target.value)} placeholder="What you achieved" /></label>
            <label>Link (optional)<input type="url" value={item.url ?? ''} onChange={(event) => updateAchievement(index, 'url', event.target.value)} placeholder="https://..." /></label>
          </article>)}
          {(content.achievements ?? []).length === 0 && <p className="admin-help">No achievements added yet. Use “Add achievement” to publish one on the homepage.</p>}
          <button className="admin-primary" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save all changes'}</button>
        </div>
      </>}
      {status && <p className="admin-status" role="status">{status}</p>}
    </section>
  </main>
}
