import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, Camera, Check, Circle, Code2, Command, Download, ExternalLink, Menu, Play, Radar, Send, Sparkles, X } from 'lucide-react'
import { GitHubSection } from './components/GitHubSection'
import { hackathons, isRealHttpUrl, journey, journal, profile, projects, skillGroups, type Project } from './data'
import { applyPageMeta } from './seo'
import { SocialIcon, SocialLinks } from './components/SocialLinks'
import { ResumeActions, resumeUploadPending } from './components/ResumeActions'

export type AppProps = { initialPath?: string }

type RouteKey = 'about' | 'projects' | 'journey' | 'hackathons' | 'writing' | 'contact'
const navItems: { label: string; path: string; key: RouteKey }[] = [
  { label: 'About', path: '/about', key: 'about' },
  { label: 'Work', path: '/projects', key: 'projects' },
  { label: 'Journey', path: '/journey', key: 'journey' },
  { label: 'Notes', path: '/writing', key: 'writing' },
]

function cleanPath(path: string) {
  const value = path.split('?')[0].replace(/\/$/, '')
  return value || '/'
}

function App({ initialPath = '/' }: AppProps) {
  const [path, setPath] = useState(() => cleanPath(initialPath))
  const [menuOpen, setMenuOpen] = useState(false)
  const [systemOpen, setSystemOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const onPopState = () => setPath(cleanPath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    applyPageMeta(path)
    document.body.style.overflow = systemOpen || menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [path, systemOpen, menuOpen])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSystemOpen(false)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function navigate(to: string) {
    const [nextPath, hash] = to.split('#')
    const next = cleanPath(nextPath || '/')
    setMenuOpen(false)
    if (window.location.pathname !== next) window.history.pushState({}, '', `${next}${hash ? `#${hash}` : ''}`)
    setPath(next)
    window.setTimeout(() => hash ? document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }) : window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
  }

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2800)
  }

  const project = projects.find((item) => path === `/projects/${item.id}`)
  const page = project ? <ProjectDetail project={project} navigate={navigate} onToast={showToast} /> : path === '/' ? <HomePage navigate={navigate} /> : path === '/about' ? <AboutPage navigate={navigate} /> : path === '/projects' ? <ProjectsPage navigate={navigate} /> : path === '/journey' ? <JourneyPage /> : path === '/hackathons' ? <HackathonsPage navigate={navigate} /> : path === '/writing' ? <WritingPage navigate={navigate} /> : path === '/contact' ? <ContactPage showToast={showToast} /> : path === '/resume' ? <ResumePage navigate={navigate} /> : <NotFound navigate={navigate} />

  return <div className="app-shell">
    <div className="grain" aria-hidden="true" />
    <Header path={path} menuOpen={menuOpen} setMenuOpen={setMenuOpen} setSystemOpen={setSystemOpen} navigate={navigate} />
    <main id="main-content">{page}</main>
    <Footer navigate={navigate} />

    {systemOpen && <SystemPanel onClose={() => setSystemOpen(false)} navigate={navigate} />}
    {toast && <div className="toast" role="status"><Check size={15} /> {toast}</div>}
  </div>
}

function Header({ path, menuOpen, setMenuOpen, setSystemOpen, navigate }: { path: string; menuOpen: boolean; setMenuOpen: (value: boolean) => void; setSystemOpen: (value: boolean) => void; navigate: (path: string) => void }) {
  return <>
    <header className="site-header">
      <a className="brand-mark" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }} aria-label="Ayush Kumar Singh home"><span className="brand-symbol">A<span>.</span></span><span className="brand-name">AYUSH<br />KUMAR SINGH</span></a>
      <nav className="desktop-nav" aria-label="Primary navigation">{navItems.map((item) => <a className={path === item.path || path.startsWith(`${item.path}/`) ? 'active' : ''} key={item.key} href={item.path} onClick={(event) => { event.preventDefault(); navigate(item.path) }}>{item.label}</a>)}</nav>
      <div className="header-actions"><SocialHeaderLink /><button className="system-trigger" onClick={() => setSystemOpen(true)} aria-haspopup="dialog"><Command size={15} /> <span>AYUSH OS</span></button><button className="menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
    </header>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{navItems.map((item) => <a key={item.key} href={item.path} onClick={(event) => { event.preventDefault(); navigate(item.path) }}>{item.label}<ArrowUpRight size={15} /></a>)}<SocialLinks className="mobile-socials" email /><a href="/resume" onClick={(event) => { event.preventDefault(); navigate('/resume') }}>Resume <Download size={15} /></a><button onClick={() => { setSystemOpen(true); setMenuOpen(false) }}>Open Ayush OS <Command size={15} /></button></nav>}
  </>
}

function HomePage({ navigate }: { navigate: (path: string) => void }) {
  return <>
    <section className="hero section-pad"><div className="hero-grid-lines" aria-hidden="true" /><div className="hero-copy"><p className="eyebrow"><span className="status-dot" /> STUDENT BUILDER / WEST BENGAL</p><h1>Hi, I'm<br /><span className="hero-name">{profile.name}.</span></h1><p className="alternate-name">Also known as {profile.alternateName}</p><div className="hero-statement"><span className="statement-index">01 /</span><p>Computer Science & Engineering student specializing in <strong>Artificial Intelligence & Machine Learning</strong>, building intelligent products, full-stack applications and experimental technology.</p></div><RotatingKeywords /><div className="hero-ctas"><button className="button button-dark" onClick={() => navigate('/projects')}>View my work <ArrowDownRight size={17} /></button><SocialButton type="github" label="GitHub" compact onPending={() => navigate('/contact')} /><SocialButton type="linkedin" label="LinkedIn" compact onPending={() => navigate('/contact')} /><SocialButton type="instagram" label="Instagram" /><ResumeActions /><a className="text-link" href={`mailto:${profile.email}`}>Email me <Send size={15} /></a><button className="text-link" onClick={() => navigate('/contact')}>Contact me <ArrowRight size={15} /></button></div>{resumeUploadPending && <p className="resume-notice">Resume PDF awaiting upload. <a href="/resume">Resume details</a></p>}</div><HeroVisual /><div className="hero-footer-line"><span>{profile.identity}</span><span>Scroll to explore <ArrowDownRight size={15} /></span></div></section>
    <section className="ticker" aria-label="Areas of focus"><div className="ticker-track"><span>AI / ML</span><i>✳</i><span>FULL-STACK DEVELOPMENT</span><i>✳</i><span>INTELLIGENT SYSTEMS</span><i>✳</i><span>HACKATHON PROJECTS</span><i>✳</i><span>DEVELOPER TOOLS</span><i>✳</i><span>AI / ML</span><i>✳</i><span>FULL-STACK DEVELOPMENT</span></div></section>
    <IdentitySection navigate={navigate} />
    <AboutSection navigate={navigate} />
    <WorkSection navigate={navigate} />
    <BuildingSection />
    <GitHubSection username={profile.githubUsername} profileUrl={profile.socials.github} pinnedRepositories={[]} />
    <SkillsSection />
    <JourneyPreview navigate={navigate} />
    <HackathonPreview navigate={navigate} />
    <WritingPreview navigate={navigate} />
    <ContactSection showToast={() => navigate('/contact')} />
  </>
}

function RotatingKeywords() { const words = ['AI / ML', 'Full-Stack Development', 'Intelligent Systems', 'Hackathon Projects', 'Developer Tools']; const [index, setIndex] = useState(0); useEffect(() => { const timer = window.setInterval(() => setIndex((current) => (current + 1) % words.length), 2600); return () => window.clearInterval(timer) }, []); return <div className="keyword-rail" aria-live="polite"><span>FOCUS /</span><strong>{words[index]}</strong><span className="keyword-dots">{words.map((word, i) => <i className={i === index ? 'active' : ''} key={word} />)}</span></div> }
function HeroVisual() { return <div className="hero-visual"><div className="visual-frame"><div className="frame-top"><span>AKS / 001</span><span>FIG. 01</span></div><div className="portrait-wrap"><img src="/avatar.svg" alt="Abstract profile mark for Ayush Kumar Singh" /><div className="portrait-cross cross-one" /><div className="portrait-cross cross-two" /><div className="orbit-ring" /></div><div className="frame-bottom"><span>WEST BENGAL / IN</span><span className="scroll-label">DIGITAL IDENTITY <ArrowDownRight size={14} /></span></div></div><div className="floating-note note-top"><span>CORE / 01</span><strong>Intelligent<br />systems</strong><ArrowUpRight size={17} /></div><div className="floating-note note-bottom"><span>STATUS</span><strong>Building<br />in public</strong><span className="mini-pulse"><Circle size={8} fill="currentColor" /></span></div></div> }

function IdentitySection({ navigate }: { navigate: (path: string) => void }) { return <section className="identity section-pad" id="identity"><SectionKicker number="01" label="THE PERSON BEHIND THE PROJECTS" /><div className="identity-layout"><div className="identity-intro"><p className="display-quote">A student<br />with a <em>builder's</em><br />mindset.</p><span className="scribble">↗</span></div><div className="identity-card"><div className="identity-card-head"><span>IDENTITY / PROFILE</span><span>AKS_2024</span></div><div className="identity-card-main"><div className="identity-avatar"><span>AK</span></div><div><h3>{profile.name}</h3><p>{profile.role}</p><p className="profile-alias">Also known as {profile.alternateName}</p></div></div><SocialLinks className="profile-socials" email /><div className="identity-details"><div><span>LOCATION</span><strong>{profile.location}</strong></div><div><span>EDUCATION</span><strong>{profile.education}</strong></div></div><div className="identity-focus"><span>CURRENT FOCUS</span><div>{['Artificial Intelligence', 'Machine Learning', 'Full-Stack Development', 'Developer Tools', 'Hackathons'].map(item => <b key={item}>{item}</b>)}</div></div><button className="inline-link identity-card-link" onClick={() => navigate('/about')}>More about Ayush <ArrowUpRight size={15} /></button></div></div></section> }

function AboutSection({ navigate }: { navigate: (path: string) => void }) { return <section className="about section-pad" id="about"><SectionKicker number="02" label="ORIENTATION" /><div className="about-grid"><div><p className="section-title">Making complex<br /><span>things useful.</span></p></div><div className="about-copy"><p>{profile.bio}</p><p>{profile.longBio}</p><button className="inline-link" onClick={() => navigate('/journey')}>Read my journey <ArrowUpRight size={16} /></button></div></div><div className="explore-block"><div><span className="eyebrow">CURRENTLY EXPLORING</span><h3>Curiosity is<br /><em>part of the process.</em></h3></div><div className="explore-list">{profile.exploring.map((item, i) => <div key={item}><span>0{i + 1}</span><strong>{item}</strong><ArrowUpRight size={15} /></div>)}</div></div></section> }

function WorkSection({ navigate }: { navigate: (path: string) => void }) { return <section className="work section-pad" id="projects"><SectionKicker number="03" label="SELECTED WORK / CURRENT EXPLORATIONS" action={<button className="kicker-link" onClick={() => navigate('/projects')}>View all projects <ArrowUpRight size={15} /></button>} /><div className="work-heading"><p className="section-title">Built to be<br /><span>useful.</span></p><p className="heading-note">A selection of experiments, systems<br />and things I cared enough to build.</p></div><div className="project-list">{projects.slice(0, 4).map((project, index) => <ProjectCard key={project.id} project={project} index={index} onOpen={() => navigate(`/projects/${project.id}`)} />)}</div><button className="all-projects-button" onClick={() => navigate('/projects')}>Explore all projects <ArrowRight size={18} /></button></section> }

function BuildingSection() { return <section className="building section-pad"><SectionKicker number="04" label="BUILDING NOW / HONEST STATUS" action={<span className="live-label"><i /> NOT REAL-TIME</span>} /><div className="building-heading"><p className="section-title">Currently<br /><span>building.</span></p><div><p>Not a status feed. Just a small window into the questions and projects taking up space in my head right now.</p></div></div><div className="building-grid">{projects.slice(0, 3).map((project) => <div className="building-card" key={project.id}><div className="building-meta"><Status status={project.status} /><span>{project.number} / 06</span></div><h3>{project.name}</h3><p>{project.label}</p><div className="building-stack">{project.stack.slice(0, 3).map(s => <span key={s}>{s}</span>)}</div><div className="card-arrow"><ArrowUpRight size={17} /></div></div>)}</div></section> }

function SkillsSection() { return <section className="skills section-pad" id="skills"><SectionKicker number="05" label="TOOLS OF THE TRADE" /><div className="skills-grid"><p className="section-title">The stack<br /><span>behind the work.</span></p><div className="skill-groups">{skillGroups.map((group, i) => <div className="skill-group" key={group.label}><div><span>0{i + 1}</span><h3>{group.label}</h3></div><div className="skill-tags">{group.items.map(skill => <span key={skill}>{skill}</span>)}</div></div>)}</div></div></section> }

function JourneyPreview({ navigate }: { navigate: (path: string) => void }) { return <section className="journey section-pad" id="journey"><SectionKicker number="06" label="THE ROAD SO FAR" action={<button className="kicker-link" onClick={() => navigate('/journey')}>Full journey <ArrowUpRight size={15} /></button>} /><div className="journey-grid"><div><p className="section-title">Learning by<br /><span>doing.</span></p><p className="journey-intro">No shortcuts, no made-up milestones. Just a steady trail of questions, projects, and new things to figure out.</p></div><Timeline /></div></section> }
function Timeline() { return <div className="timeline">{journey.map((item) => <div className="timeline-item" key={item.title}><span className="timeline-year">{item.year}</span><div className="timeline-dot"><i /></div><div><h3>{item.title}</h3><span>{item.org}</span><p>{item.text}</p></div></div>)}</div> }

function HackathonPreview({ navigate }: { navigate: (path: string) => void }) { return <section className="hackathons section-pad"><SectionKicker number="07" label="HACKATHONS & INNOVATION" action={<button className="kicker-link" onClick={() => navigate('/hackathons')}>View innovation work <ArrowUpRight size={15} /></button>} /><div className="hackathon-heading"><p className="section-title">Ideas under<br /><span>pressure.</span></p><p>Hackathons are a practice ground: identify the problem, choose the smallest useful system, and learn from what the constraints reveal.</p></div><div className="hackathon-strip">{hackathons.map((item) => <div key={item.id}><span>{item.number} / PROJECT</span><h3>{item.name}</h3><p>{item.category}</p><ArrowUpRight size={17} /></div>)}</div></section> }

function WritingPreview({ navigate }: { navigate: (path: string) => void }) { return <section className="journal section-pad" id="writing"><SectionKicker number="08" label="NOTES / IN PROGRESS" action={<button className="kicker-link" onClick={() => navigate('/writing')}>Read the journal <ArrowUpRight size={15} /></button>} /><div className="journal-heading"><p className="section-title">Thinking<br /><span>out loud.</span></p><div className="journal-icon"><BookOpen size={40} strokeWidth={1} /><span>NOTES FROM THE<br />BUILDING PROCESS</span></div></div><JournalList /></section> }
function JournalList() { return <div className="journal-list">{journal.map((note, i) => <article className="journal-card" key={note.slug}><span className="journal-number">0{i + 1}</span><div><span className="journal-type">{note.type}</span><h3>{note.title}</h3><p>{note.description}</p></div><div className="journal-date">{note.date || 'Not published yet'}{note.readingTime && ` · ${note.readingTime}`}<ArrowUpRight size={16} /></div></article>)}</div> }

function ContactSection({ showToast }: { showToast: () => void }) { return <section className="contact section-pad" id="contact"><div className="contact-grid"><div><span className="eyebrow">HAVE A GOOD PROBLEM?</span><p className="contact-title">Let's make<br /><em>something</em><br />useful.</p></div><div className="contact-side"><p>I’m always interested in thoughtful problems, interesting collaborations, and conversations about building for the real world.</p><ContactLinks showToast={showToast} /></div></div><div className="contact-bottom"><span>AYUSH // DIGITAL SYSTEM</span><span>OPEN TO GOOD CONVERSATIONS <ArrowUpRight size={14} /></span></div></section> }

function SectionKicker({ number, label, action }: { number: string; label: string; action?: ReactNode }) { return <div className="section-kicker"><span>{number}</span><span>{label}</span>{action}</div> }
function Status({ status }: { status: Project['status'] }) { return <span className={`status-pill ${status.toLowerCase()}`}><i /> {status}</span> }

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) { return <article className={`project-card project-${index}`} role="button" onClick={onOpen} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen() } }} aria-label={`Open ${project.name} case study`}><div className="project-card-top"><span>{project.number} / 06</span><span className="project-category">{project.category}</span><ArrowUpRight size={18} /></div><div className="project-card-body"><div><h3>{project.name}</h3><p>{project.description}</p></div><Status status={project.status} /></div><ProjectVisual index={index} /><div className="project-card-bottom"><div>{project.stack.slice(0, 3).map(s => <span key={s}>{s}</span>)}</div><span>View case study <ArrowRight size={15} /></span></div></article> }
function ProjectVisual({ index }: { index: number }) { return <div className="project-card-visual">{index === 0 ? <><div className="visual-bar" /><div className="visual-slab">ESCROW<br /><span>PROTOCOL</span></div><div className="visual-lines" /></> : index === 1 ? <><div className="radar"><Radar size={100} strokeWidth={.6} /><span /></div><div className="sat-label">SAT / QUERY<br /><small>AI · 01</small></div></> : index === 2 ? <><div className="orbit-planet" /><div className="orbit-path path-a" /><div className="orbit-path path-b" /><span className="orbit-tag">ORBIT / 07</span></> : <><div className="audit-grid" /><div className="audit-window"><span>ANOMALY</span><strong>INSIGHT</strong><div /></div></>}</div> }

function ProjectsPage({ navigate }: { navigate: (path: string) => void }) { return <PageLayout kicker="PROJECT INDEX" number="01" title={<>Projects built<br /><span>with intent.</span></>} intro="A working archive of AI/ML, full-stack, backend, geospatial, and experimental technology projects. Open a case study for the problem, approach, architecture, and current status."><div className="project-index-grid">{projects.map((project, index) => <a key={project.id} className="project-index-card" href={`/projects/${project.id}`} onClick={(event) => { event.preventDefault(); navigate(`/projects/${project.id}`) }}><span>{project.number} / {project.category}</span><h2>{project.name}<i><ArrowUpRight size={19} /></i></h2><p>{project.description}</p><div><Status status={project.status} />{project.stack.slice(0, 3).map((skill) => <b key={skill}>{skill}</b>)}</div></a>)}</div></PageLayout> }

function ProjectDetail({ project, navigate, onToast }: { project: Project; navigate: (path: string) => void; onToast: (message: string) => void }) { return <PageLayout kicker={`${project.number} / CASE STUDY`} number="WORK" title={<>{project.name}<span>.</span></>} intro={project.description}><div className="case-study-meta"><Status status={project.status} /><span>{project.category}</span><span>{project.role}</span></div><div className="case-study-grid"><div><CaseBlock title="Problem"><p>{project.problem}</p><h3>Why it matters</h3><p>Useful engineering starts with a clear understanding of who is affected by the problem and what a better workflow could make possible.</p></CaseBlock><CaseBlock title="Approach"><p>{project.solution}</p><h3>Implementation</h3><p>{project.outcome}</p></CaseBlock></div><div><CaseBlock title="Architecture"><div className="architecture architecture-large">{project.architecture.map((part, i) => <div key={part}><span>{part}</span>{i < project.architecture.length - 1 && <ArrowDownRight size={15} />}</div>)}</div></CaseBlock><CaseBlock title="Technology"><div className="modal-tech">{project.stack.map((skill) => <span key={skill}>{skill}</span>)}</div></CaseBlock><CaseBlock title="Screenshots"><div className="empty-screenshots"><Radar size={23} /><p>{project.screenshots.length ? 'Project visuals are available in the repository.' : 'Screenshots can be added when verified project imagery is available.'}</p></div></CaseBlock></div></div><div className="case-study-actions">{safeAnchor(project.githubUrl, 'GitHub', Code2, onToast)}{safeAnchor(project.liveUrl, 'Live demo', Play, onToast)}<button className="button button-outline" onClick={() => navigate('/projects')}><ArrowLeft size={15} /> All projects</button></div></PageLayout> }
function CaseBlock({ title, children }: { title: string; children: ReactNode }) { return <section className="case-block"><span className="modal-label">{title}</span>{children}</section> }
function safeAnchor(url: string, label: string, Icon: typeof Code2, onToast: (message: string) => void) { return isRealHttpUrl(url) ? <a className="button button-dark" href={url} target="_blank" rel="noreferrer"><Icon size={15} /> {label} <ArrowUpRight size={15} /></a> : <button className="button button-outline" onClick={() => onToast(`Add a verified ${label} URL in src/data.ts`)}><Icon size={15} /> {label} <ArrowUpRight size={15} /></button> }

function AboutPage({ navigate }: { navigate: (path: string) => void }) { return <PageLayout kicker="PROFILE / ABOUT" number="01" title={<>Engineering with<br /><span>curiosity.</span></>} intro={`${profile.name}, also known as ${profile.alternateName}, is a Computer Science & Engineering student specializing in Artificial Intelligence & Machine Learning.`}><div className="long-page-grid"><div><h2>Practical software,<br />honest progress.</h2><p>{profile.longBio}</p><button className="inline-link" onClick={() => navigate('/projects')}>See the project archive <ArrowUpRight size={15} /></button></div><div className="identity-card about-card"><div className="identity-card-head"><span>PROFILE DATA</span><span>AYUSH / IDENTITY</span></div><SocialLinks className="profile-socials" email /><div className="identity-details"><div><span>LOCATION</span><strong>{profile.location}</strong></div><div><span>EDUCATION</span><strong>{profile.education}</strong></div></div><div className="identity-focus"><span>EXPLORING</span><div>{profile.exploring.map(item => <b key={item}>{item}</b>)}</div></div></div></div><SkillsSection /></PageLayout> }
function JourneyPage() { return <PageLayout kicker="JOURNEY / TIMELINE" number="02" title={<>Learning by<br /><span>doing.</span></>} intro="A student journey built from study, project work, hackathons, and technical questions worth following. Dates and milestones remain intentionally editable."><div className="journey-full"><Timeline /></div></PageLayout> }
function HackathonsPage({ navigate }: { navigate: (path: string) => void }) { return <PageLayout kicker="HACKATHONS / INNOVATION" number="03" title={<>Ideas under<br /><span>pressure.</span></>} intro="Hackathons are a practice ground for choosing a useful scope, collaborating under constraints, and learning from the gap between an idea and a working system."><div className="innovation-grid">{hackathons.map((item) => <article key={item.id} className="innovation-card"><div><span>{item.number} / PROJECT</span><Status status={item.status} /></div><h2>{item.name}</h2><h3>Problem statement</h3><p>{item.problem}</p><h3>Innovation</h3><p>{item.innovation}</p><div className="building-stack">{item.stack.slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}</div><button className="inline-link" onClick={() => navigate(`/projects/${item.id}`)}>Open case study <ArrowUpRight size={15} /></button></article>)}</div><p className="honesty-note"><Sparkles size={15} /> Participation, role, and outcomes should be filled with verified event details before publication. No wins, selections, or prizes are claimed here.</p></PageLayout> }
function WritingPage({ navigate }: { navigate: (path: string) => void }) { return <PageLayout kicker="WRITING / ENGINEERING JOURNAL" number="04" title={<>Thinking<br /><span>out loud.</span></>} intro="A place for genuine notes about building, learning, and the decisions behind the work. Unpublished topics stay clearly labeled until there is something real to say."><div className="writing-index"><JournalList />{journal.map((note) => <article className="article-placeholder" key={note.slug}><div><span>{note.type}</span><h2>{note.title}</h2><p>{note.description}</p></div><span>Unpublished</span></article>)}</div><button className="button button-outline" onClick={() => navigate('/contact')}>Suggest a conversation <ArrowUpRight size={15} /></button></PageLayout> }
function ContactPage({ showToast }: { showToast: (message: string) => void }) { return <PageLayout kicker="CONTACT / OPEN CHANNEL" number="05" title={<>Let's make<br /><span>something</span><br />useful.</>} intro="Thoughtful problems, interesting collaborations, and conversations about building for the real world are welcome. Connect by email or through my public profiles."><ContactForm showToast={showToast} /></PageLayout> }
function ResumePage({ navigate }: { navigate: (path: string) => void }) {
  return <PageLayout kicker="RESUME / PROFILE" number="06" title={<>A clear view<br /><span>of the work.</span></>} intro={`The professional resume of ${profile.name}. View the PDF in a new tab or download a copy.`}>
    <div className="resume-panel"><Download size={34} aria-hidden="true" /><h2>{resumeUploadPending ? 'Resume PDF awaiting upload.' : `${profile.name} — Resume`}</h2>
      <p id="resume-file-notice">{resumeUploadPending ? <>The real PDF has not been supplied in this project yet. Both actions below point to <code>/resume.pdf</code>, which will work after the owner places the real file at <code>public/resume.pdf</code> and redeploys. No resume content has been generated.</> : 'This document is provided by Ayush. The PDF can be replaced without changing the website code.'}</p>
      <div className="case-study-actions" aria-describedby="resume-file-notice"><ResumeActions /></div>
      <button className="inline-link identity-card-link" onClick={() => navigate('/contact')}>Get in touch <ArrowUpRight size={15} /></button>
    </div>
  </PageLayout>
}
function NotFound({ navigate }: { navigate: (path: string) => void }) { return <PageLayout kicker="404 / NOT FOUND" number="ERR" title={<>This page<br /><span>isn't here.</span></>} intro="The requested route does not exist in Ayush Kumar Singh’s digital system."><button className="button button-dark" onClick={() => navigate('/')}>Return home <ArrowRight size={15} /></button></PageLayout> }
function PageLayout({ kicker, number, title, intro, children }: { kicker: string; number: string; title: ReactNode; intro: string; children?: ReactNode }) { return <section className="inner-page section-pad"><SectionKicker number={number} label={kicker} /><div className="inner-hero"><h1>{title}</h1><p>{intro}</p></div>{children}</section> }

function ContactForm({ showToast }: { showToast: (message: string) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.checkValidity()) { form.reportValidity(); return }
    const fields = new FormData(form)
    const subject = `Portfolio enquiry from ${String(fields.get('name')).trim()}`
    const body = `${String(fields.get('message')).trim()}\n\nFrom: ${fields.get('name')}\nReply to: ${fields.get('email')}`
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    showToast('Opening your email app. Review the draft and send it there; nothing has been sent by this website.')
  }
  return <div className="contact-form-wrap"><form className="contact-form" onSubmit={submit}><label>Your name<input required maxLength={100} name="name" autoComplete="name" placeholder="Name" /></label><label>Email<input required maxLength={254} type="email" name="email" autoComplete="email" placeholder="you@example.com" /></label><label>What are you thinking about?<textarea required maxLength={2000} name="message" rows={5} placeholder="A project, a problem, a good question..." /></label><button className="button button-dark" type="submit">Open email draft <Send size={15} /></button></form><div className="contact-note"><span className="modal-label">DIRECT EMAIL</span><p>This form opens a draft in your email app. The website does not send or store your message. You can also email me directly or connect through my public profiles.</p><ContactLinks showToast={showToast} /></div></div>
}
function ContactLinks(_props: { showToast: (message: string) => void }) { return <><a className="email-link public-email" href={`mailto:${profile.email}`}>{profile.email} <Send size={15} aria-hidden="true" /></a><SocialLinks className="contact-links" /></> }
function SocialButton({ type, label }: { type: 'github' | 'linkedin' | 'instagram'; label: string; compact?: boolean; onPending?: () => void }) { return <a className="button button-outline" href={profile.socials[type]} target="_blank" rel="noopener noreferrer"><SocialIcon platform={type} size={16} /> {label} <ArrowUpRight size={15} aria-hidden="true" /></a> }
function SocialHeaderLink() { return <SocialLinks className="header-social-links" iconOnly email /> }
function FooterSocialLink({ label, url }: { label: string; url: string }) { return isRealHttpUrl(url) ? <a href={url} target="_blank" rel="noreferrer">{label}</a> : <span className="footer-pending">{label} pending</span> }

function Footer({ navigate }: { navigate: (path: string) => void }) { return <footer className="site-footer"><div className="footer-top"><a className="brand-mark footer-brand" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}><span className="brand-symbol">A<span>.</span></span><span className="brand-name">AYUSH<br />KUMAR SINGH</span></a><p>CSE · AI/ML · DEVELOPER<br />Building intelligent software<br />& experimental technology.</p><div className="footer-nav">{navItems.map(item => <a key={item.key} href={item.path} onClick={(event) => { event.preventDefault(); navigate(item.path) }}>{item.label}</a>)}<a href="/contact" onClick={(event) => { event.preventDefault(); navigate('/contact') }}>Contact</a><a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" title={resumeUploadPending ? 'PDF awaiting upload at /resume.pdf' : 'View resume PDF'}>Resume <Download size={13} /></a><SocialLinks className="footer-socials" email /></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Ayush Kumar Singh</span><span>Designed & built with intention <Sparkles size={13} /></span><a href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}>Back to top ↑</a></div></footer> }

function ProjectModal({ project, onClose, onToast }: { project: Project; onClose: () => void; onToast: (message: string) => void }) { return <div className="modal-backdrop" onClick={onClose}><div className="project-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="project-title"><button className="modal-close" onClick={onClose} aria-label="Close project"><X size={20} /></button><div className="modal-kicker"><span>{project.number} / CASE STUDY</span><Status status={project.status} /></div><h2 id="project-title">{project.name}<span>.</span></h2><p className="modal-lead">{project.description}</p><div className="modal-columns"><div><span className="modal-label">THE PROBLEM</span><p>{project.problem}</p><span className="modal-label">THE APPROACH</span><p>{project.solution}</p><span className="modal-label">WHAT I LEARNED</span><p>{project.outcome}</p></div><div><span className="modal-label">ARCHITECTURE</span><div className="architecture">{project.architecture.map((part, i) => <div key={part}><span>{part}</span>{i < project.architecture.length - 1 && <ArrowDownRight size={15} />}</div>)}</div><span className="modal-label">TECHNOLOGY</span><div className="modal-tech">{project.stack.map(s => <span key={s}>{s}</span>)}</div></div></div><div className="modal-actions">{safeAnchor(project.githubUrl, 'GitHub', Code2, onToast)}{safeAnchor(project.liveUrl, 'Live demo', Play, onToast)}</div></div></div> }
function SystemPanel({ onClose, navigate }: { onClose: () => void; navigate: (path: string) => void }) { const items = useMemo(() => [{ icon: '◎', label: 'Profile', path: '/about' }, { icon: '↗', label: 'Projects', path: '/projects' }, { icon: '◌', label: 'Skills', path: '/about#skills' }, { icon: '⌁', label: 'Journey', path: '/journey' }, { icon: '◒', label: 'Currently Building', path: '/#projects' }, { icon: '✳', label: 'Currently Learning', path: '/about' }, { icon: '→', label: 'Contact', path: '/contact' }], [])
  return <div className="system-backdrop" onClick={onClose}><aside className="system-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="system-title"><div className="system-head"><div><span className="eyebrow">AYUSH // DIGITAL SYSTEM</span><h2 id="system-title">Command<br /><em>center.</em></h2></div><button className="modal-close" autoFocus onClick={onClose} aria-label="Close system"><X size={20} /></button></div><div className="system-status"><span><i /> SYSTEM ONLINE</span><span>v.01.24</span></div><div className="system-menu">{items.map((item, i) => <button key={item.label} onClick={() => { navigate(item.path); onClose() }}><span className="system-item-index">0{i + 1}</span><span className="system-item-icon">{item.icon}</span><strong>{item.label}</strong><ArrowUpRight size={16} /></button>)}</div><div className="system-foot"><span>WEST BENGAL, INDIA</span><span>LOCAL TIME / {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div></aside></div> }

export default App
