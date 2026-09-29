import { Download, ExternalLink } from 'lucide-react'
import { profile } from '../data'

export const localResumeAvailable = __LOCAL_RESUME_AVAILABLE__
export const resumeUploadPending = profile.resumeUrl === '/resume.pdf' && !localResumeAvailable

/** These are real PDF links, not links back to the resume page. */
export function ResumeActions() {
  return <>
    <a className="button button-outline" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" /> View Resume</a>
    <a className="button button-outline" href={profile.resumeUrl} download="Ayush-Kumar-Singh-Resume.pdf"><Download size={15} aria-hidden="true" /> Download Resume</a>
  </>
}
