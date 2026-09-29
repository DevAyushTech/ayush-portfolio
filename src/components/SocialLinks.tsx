import { Mail } from 'lucide-react'
import { profile } from '../data'

export type SocialPlatform = keyof typeof profile.socials
const labels: Record<SocialPlatform, string> = { github: 'GitHub', linkedin: 'LinkedIn', instagram: 'Instagram' }

/** Inline brand marks; no icon-font or third-party image requests. */
export function SocialIcon({ platform, size = 17 }: { platform: SocialPlatform; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    {platform === 'github' ? <path fill="currentColor" d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.14.69-3.8-1.33-3.8-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.03-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.73 2.63 1.23 3.27.94.1-.73.4-1.23.72-1.51-2.51-.29-5.15-1.26-5.15-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.64 0c2.15-1.45 3.09-1.15 3.09-1.15.62 1.55.23 2.7.12 2.98.72.79 1.16 1.79 1.16 3.02 0 4.32-2.65 5.28-5.17 5.56.41.36.77 1.04.77 2.1v3.09c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z" /> : platform === 'linkedin' ? <>
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="7" cy="7" r="1.4" fill="currentColor" /><path d="M7 10v8m5 0v-8m0 4a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="2" />
    </> : <>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </>}
  </svg>
}

export function SocialLinks({ className = '', iconOnly = false, email = false }: { className?: string; iconOnly?: boolean; email?: boolean }) {
  return <div className={`social-links ${className}`}>
    {(Object.keys(profile.socials) as SocialPlatform[]).map(platform => <a key={platform} href={profile.socials[platform]} target="_blank" rel="noopener noreferrer" aria-label={iconOnly ? `${profile.name} on ${labels[platform]}` : undefined} title={iconOnly ? labels[platform] : undefined}>
      <SocialIcon platform={platform} />{!iconOnly && labels[platform]}
    </a>)}
    {email && <a href={`mailto:${profile.email}`} aria-label={iconOnly ? `Email ${profile.name}` : undefined} title={iconOnly ? 'Email' : undefined}><Mail size={17} aria-hidden="true" />{!iconOnly && 'Email'}</a>}
  </div>
}
