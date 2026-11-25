import { useEffect, useState } from 'react'
import './admin.css'
import { fetchPortfolioContent, type PortfolioContent } from './supabase-content'

const SUPABASE_URL = 'https://ajsguwoenolcdahguzjc.supabase.co'
const SUPABASE_KEY = 'sb_publishable_BOGmNbRLkcK5NTq38xtduA_GSCBuobp'
const OWNER_EMAIL = 'connect.ayushkumarsingh@gmail.com'
const TOKEN_KEY = 'portfolio-admin-session'

type AuthUser = { id: string; email?: string }
type Session = { access_token: string; refresh_token?: string; user: AuthUser }

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

export default function AdminPage() {
  const [email, setEmail] = useState(OWNER_EMAIL)
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [contentText, setContentText] = useState('{"announcement":"","achievements":[],"profile":{}}')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY)
    if (!stored) return
    try {
      const value = JSON.parse(stored) as Session
      if (value.user?.email?.toLowerCase() === OWNER_EMAIL) setSession(value)
    } catch {
      sessionStorage.removeItem(TOKEN_KEY)
    }
  }, [])

  useEffect(() => {
    if (!session) return
    let cancelled = false
    fetchPortfolioContent().then((content) => {
      if (!cancelled) setContentText(JSON.stringify(content, null, 2))
    })
    return () => { cancelled = true }
  }, [session])

  async function login(signUp = false) {
    setBusy(true); setStatus('')
    try {
      if (email.trim().toLowerCase() !== OWNER_EMAIL) throw new Error('This admin account is restricted to the portfolio owner email.')
      const data = await authRequest(signUp ? 'signup' : 'token?grant_type=password', { email: email.trim(), password })
      if (!data.access_token || !data.user) {
        setStatus('Account request submitted. If email confirmation is enabled, confirm your email, then sign in.')
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

  async function save() {
    if (!session) return
    setBusy(true); setStatus('')
    try {
      const content = JSON.parse(contentText) as PortfolioContent
      if (!content || Array.isArray(content) || typeof content !== 'object') throw new Error('Content must be a JSON object.')
      const response = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_content?on_conflict=id`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({ id: 'site', content, updated_at: new Date().toISOString(), updated_by: session.user.id }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || data.details || 'Save failed. Check the session and database policy.')
      setContentText(JSON.stringify(content, null, 2))
      setStatus('Saved. The public site will pick up the changes within about 30 seconds.')
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
      <p className="admin-intro">Manage portfolio achievements and announcement content. Updates are stored in Supabase and do not require a site redeploy.</p>
      {!session ? <form className="admin-auth" onSubmit={(event) => { event.preventDefault(); void login(false) }}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="current-password" /></label>
        <button className="admin-primary" disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}</button>
        <button className="admin-secondary" type="button" disabled={busy} onClick={() => void login(true)}>Create owner account</button>
      </form> : <>
        <div className="admin-session"><span>Signed in as {session.user.email}</span><button className="admin-secondary" onClick={logout}>Sign out</button></div>
        <div className="admin-editor">
          <label htmlFor="portfolio-content">Editable content (JSON)</label>
          <textarea id="portfolio-content" spellCheck={false} value={contentText} onChange={(event) => setContentText(event.target.value)} />
          <p className="admin-help">Use <code>announcement</code> for a homepage update, <code>profile.bio</code> to override the hero summary, and <code>achievements</code> as an array of items with title, organization, date, description, and optional url. Keep valid JSON.</p>
          <button className="admin-primary" disabled={busy} onClick={() => void save()}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </>}
      {status && <p className="admin-status" role="status">{status}</p>}
    </section>
  </main>
}
