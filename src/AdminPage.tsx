import { useEffect, useState } from 'react'
import './admin.css'
import { fetchPortfolioContent, type Achievement, type PortfolioContent } from './supabase-content'

const SUPABASE_URL = 'https://ajsguwoenolcdahguzjc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BOGmNbRLkcK5NTq38xtduA_GSCBuobp'
const OWNER_EMAIL = 'connect.ayushkumarsingh@gmail.com'
const TOKEN_KEY = 'portfolio-admin-session'

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

export default function AdminPage() {
  const [email, setEmail] = useState(OWNER_EMAIL)
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [content, setContent] = useState<PortfolioContent>({ announcement: '', achievements: [], profile: { bio: '' } })
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
    } catch {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchPortfolioContent().then((value) => {
      if (cancelled) return
      setContent({
        ...value,
        announcement: value.announcement ?? '',
        achievements: value.achievements ?? [],
        profile: { ...value.profile, bio: value.profile?.bio ?? '' },
      })
    })
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

  function addAchievement() {
    setContent((current) => ({ ...current, achievements: [...(current.achievements ?? []), { title: '' }] }))
  }

  function removeAchievement(index: number) {
    setContent((current) => ({ ...current, achievements: (current.achievements ?? []).filter((_, itemIndex) => itemIndex !== index) }))
  }

  async function save() {
    if (!session) return
    const achievements = content.achievements ?? []
    if (achievements.some((item) => !item.title.trim())) {
      setStatus('Add a title to each achievement or remove the empty item.')
      return
    }
    for (const item of achievements) {
      if (item.url) {
        try {
          const url = new URL(item.url)
          if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
        } catch { setStatus('Achievement links must be valid http or https URLs.'); return }
      }
    }
    setBusy(true); setStatus('')
    try {
      let current = session
      if (current.expires_at && current.expires_at * 1000 < Date.now() + 60000) {
        current = await refreshSession(current)
        setSession(current)
      }
      const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_content?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${current.access_token}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
          id: 'site',
          content: { ...content, achievements },
          updated_at: new Date().toISOString(),
          updated_by: current.user.id,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || data.details || 'Save failed. Check your session and database policy.')
      setStatus('Saved. The public homepage will update within about 30 seconds.')
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
      <h1>{session ? 'Content dashboard' : 'Admin sign in'}</h1>
      <p className="admin-intro">Manage achievements, homepage announcement and profile summary. Changes are saved to Supabase and do not require a site redeploy.</p>
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
          <label>Profile summary<textarea rows={4} value={content.profile?.bio ?? ''} onChange={(event) => setContent((current) => ({ ...current, profile: { ...current.profile, bio: event.target.value } }))} placeholder="Leave empty to keep the current homepage summary" /></label>
          <div className="admin-achievements-head"><h2>Achievements</h2><button className="admin-secondary" type="button" onClick={addAchievement}>+ Add achievement</button></div>
          {(content.achievements ?? []).map((item, index) => <article className="admin-achievement" key={index}>
            <div className="admin-achievement-title"><strong>Achievement {index + 1}</strong><button className="admin-remove" type="button" onClick={() => removeAchievement(index)}>Remove</button></div>
            <label>Title<input value={item.title} onChange={(event) => updateAchievement(index, 'title', event.target.value)} placeholder="Award or accomplishment" /></label>
            <div className="admin-fields-row"><label>Organization<input value={item.organization ?? ''} onChange={(event) => updateAchievement(index, 'organization', event.target.value)} placeholder="Event / organization" /></label><label>Date<input value={item.date ?? ''} onChange={(event) => updateAchievement(index, 'date', event.target.value)} placeholder="e.g. Nov 2026" /></label></div>
            <label>Description<textarea rows={3} value={item.description ?? ''} onChange={(event) => updateAchievement(index, 'description', event.target.value)} placeholder="What you achieved" /></label>
            <label>Link (optional)<input type="url" value={item.url ?? ''} onChange={(event) => updateAchievement(index, 'url', event.target.value)} placeholder="https://..." /></label>
          </article>)}
          {(content.achievements ?? []).length === 0 && <p className="admin-help">No achievements added yet. Use “Add achievement” to publish one on the homepage.</p>}
          <button className="admin-primary" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </>}
      {status && <p className="admin-status" role="status">{status}</p>}
    </section>
  </main>
}
