import { normalizeSiteUrl } from './site-url'

export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || '')

export const profile = {
  name: 'Ayush Kumar Singh',
  alternateName: 'Ayush Singh',
  firstName: 'Ayush',
  role: 'CSE · AI/ML · DEVELOPER',
  identity: 'B.Tech CSE — Artificial Intelligence & Machine Learning',
  location: 'West Bengal, India',
  education: 'Narula Institute of Technology',
  email: 'connect.ayushkumarsingh@gmail.com',
  // Place your actual PDF at public/resume.pdf. No generated resume is supplied.
  resumeUrl: '/resume.pdf',
  githubUsername: 'DevAyushTech',
  socials: {
    github: 'https://github.com/DevAyushTech',
    linkedin: 'https://www.linkedin.com/in/connect-ayushsingh/',
    instagram: 'https://www.instagram.com/be.aayushh/',
  },
  bio: 'Computer Science & Engineering student specializing in Artificial Intelligence & Machine Learning, building intelligent products, full-stack applications, and experimental technology.',
  longBio: 'My work moves between AI/ML, web development, backend engineering, data and automation, geospatial / satellite AI, blockchain experimentation, and developer tools. I like taking an ambiguous problem, turning it into a working system, and learning in public through projects and hackathons.',
  exploring: ['Applied AI', 'LLM applications', 'Computer Vision', 'Geospatial AI', 'Intelligent automation', 'Scalable backend systems'],
}

export type ProjectStatus = 'Exploring' | 'Building' | 'Testing' | 'Completed'

export type Project = {
  id: string
  number: string
  name: string
  label: string
  description: string
  problem: string
  solution: string
  stack: string[]
  status: ProjectStatus
  category: string
  githubUrl: string
  liveUrl: string
  architecture: string[]
  screenshots: string[]
  role: string
  outcome: string
}

export const projects: Project[] = [
  {
    id: 'auto-escrow', number: '01', name: 'Auto Escrow', label: 'Transaction infrastructure',
    description: 'A production-oriented intelligent escrow platform exploring automated transaction workflows, backend infrastructure and blockchain integration.',
    problem: 'Trust and coordination get difficult when a transaction has several people, conditions, and hand-offs.',
    solution: 'A structured escrow workflow that makes states, authentication, API boundaries, and contract integration explicit.',
    stack: ['FastAPI', 'PostgreSQL', 'Blockchain', 'Smart Contracts', 'REST APIs', 'Authentication'], status: 'Building', category: 'BACKEND / WEB3',
    githubUrl: '', liveUrl: '', architecture: ['Client', 'FastAPI API', 'PostgreSQL', 'Smart contract'], screenshots: [],
    role: 'Project builder', outcome: 'Exploring a production-oriented transaction workflow without claiming launch metrics.',
  },
  {
    id: 'satquery-ai', number: '02', name: 'SatQuery AI', label: 'Remote sensing intelligence',
    description: 'AI-assisted satellite imagery analysis / remote sensing project for asking better questions of geospatial data.',
    problem: 'Satellite imagery is rich with information, but the path from a raster file to a useful answer can be difficult.',
    solution: 'An exploration of natural-language analysis over satellite imagery using GeoChat-7B and geospatial Python tooling.',
    stack: ['GeoChat-7B', 'Remote Sensing', 'Satellite Imagery', 'GeoTIFF', 'Rasterio', 'Python', 'AI/ML'], status: 'Exploring', category: 'AI / GEOSPATIAL',
    githubUrl: '', liveUrl: '', architecture: ['GeoTIFF input', 'Rasterio pipeline', 'GeoChat-7B', 'Insight layer'], screenshots: [],
    role: 'AI/ML project builder', outcome: 'A research-oriented exploration; no performance claims are published until verified.',
  },
  {
    id: 'orbitrakshak', number: '03', name: 'OrbitRakshak', label: 'Orbital decision support',
    description: 'Adaptive collision intelligence / satellite conjunction decision-support concept.',
    problem: 'Conjunction data is technical and time-sensitive; decision support needs to be explainable as well as useful.',
    solution: 'A concept that combines orbital data, propagation tools, and a human-readable AI explanation layer.',
    stack: ['Python', 'FastAPI', 'SGP4 / Skyfield', 'Orbital Data', 'React', 'AI explanation layer'], status: 'Testing', category: 'AI / SPACE',
    githubUrl: '', liveUrl: '', architecture: ['React dashboard', 'FastAPI', 'SGP4 / Skyfield', 'Explanation layer'], screenshots: [],
    role: 'Concept and prototype builder', outcome: 'A decision-support concept under iterative exploration.',
  },
  {
    id: 'ghostaudit-ai', number: '04', name: 'GhostAudit AI', label: 'Anomaly analysis',
    description: 'Fraud and anomaly analysis dashboard for making patterns in CSV data easier to inspect.',
    problem: 'A spreadsheet can contain a signal, but raw rows make it hard to see where attention is needed.',
    solution: 'A visual workspace for CSV analysis, maps, and anomaly-oriented views using a lightweight Python backend.',
    stack: ['React', 'Tailwind CSS', 'Python', 'Flask', 'Data Visualization', 'CSV Analysis', 'Maps'], status: 'Completed', category: 'DATA / FULL-STACK',
    githubUrl: '', liveUrl: '', architecture: ['React UI', 'Flask API', 'CSV parser', 'Visual analysis'], screenshots: [],
    role: 'Full-stack project builder', outcome: 'A completed project exploration; measured outcomes are not published without verified data.',
  },
  {
    id: 'verifyx', number: '05', name: 'VerifyX', label: 'Trust-focused workflows',
    description: 'A verification-focused web application exploring clearer signals in job and identity workflows.',
    problem: 'Verification processes often feel fragmented, opaque, and difficult to navigate.',
    solution: 'A focused application concept that brings the workflow, evidence, and outcome into one place.',
    stack: ['React', 'REST APIs', 'Authentication', 'Database'], status: 'Exploring', category: 'WEB APPLICATION',
    githubUrl: '', liveUrl: '', architecture: ['Web client', 'API', 'Verification data', 'Review flow'], screenshots: [],
    role: 'Application builder', outcome: 'An exploratory product concept; status remains intentionally conservative.',
  },
  {
    id: 'bloomlink', number: '06', name: 'BloomLink', label: 'Connection layer',
    description: 'A project exploring how a simple product experience can connect people, ideas, and useful actions.',
    problem: 'Good ideas lose momentum when the next useful connection is hidden behind friction.',
    solution: 'A small, focused product exploration centered on discoverability and intentional interaction.',
    stack: ['React', 'JavaScript', 'CSS', 'GitHub'], status: 'Exploring', category: 'PRODUCT EXPERIMENT',
    githubUrl: '', liveUrl: '', architecture: ['Interface', 'Application logic', 'Data layer'], screenshots: [],
    role: 'Product experimenter', outcome: 'A small product exploration without invented adoption or usage figures.',
  },
]

export const skillGroups = [
  { label: 'AI / ML', items: ['Python', 'Machine Learning', 'Computer Vision', 'LLM Applications', 'NLP', 'Remote Sensing / Geospatial AI'] },
  { label: 'FRONTEND', items: ['HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'Tailwind CSS'] },
  { label: 'BACKEND', items: ['Python', 'FastAPI', 'Flask', 'REST APIs', 'Authentication'] },
  { label: 'DATA & TOOLS', items: ['PostgreSQL', 'Firebase', 'Supabase', 'SQLite', 'Git', 'GitHub', 'VS Code', 'Docker', 'Postman'] },
  { label: 'CLOUD / WEB3', items: ['Vercel', 'Netlify', 'Render', 'Smart Contracts', 'Web3', 'Ethereum / Sepolia'] },
]

export const journey = [
  { year: 'NOW', title: 'B.Tech CSE — AI & ML', org: 'Narula Institute of Technology · West Bengal, India', text: 'Building a foundation in computer science while exploring intelligent systems through projects.' },
  { year: '01', title: 'AI/ML exploration', org: 'Learning through experiments', text: 'Working through applied AI, LLM applications, computer vision, and data-driven ideas.' },
  { year: '02', title: 'Full-stack development', org: 'Interfaces to infrastructure', text: 'Growing across frontend systems, backend APIs, authentication, and product thinking.' },
  { year: '03', title: 'Hackathon builder', org: 'Projects under constraints', text: 'Using hackathons as a forcing function for collaboration, scope, and shipping.' },
  { year: '04', title: 'Geospatial & blockchain experiments', org: 'New technical terrain', text: 'Exploring satellite imagery, orbital data, smart contracts, and their practical edges.' },
]

export const journal = [
  { slug: 'how-i-approach-hackathon-projects', title: 'How I Approach Hackathon Projects', type: 'FIELD NOTE', date: '', readingTime: '', description: 'An upcoming note on turning a wide problem space into a focused, testable project.' },
  { slug: 'designing-a-production-ready-fastapi-backend', title: 'Designing a Production-Ready FastAPI Backend', type: 'ENGINEERING JOURNAL', date: '', readingTime: '', description: 'Upcoming notes on clear boundaries, authentication, and building for the next version.' },
  { slug: 'learning-ai-ml-as-a-cse-student', title: 'Learning AI/ML as a CSE Student', type: 'LEARNING LOG', date: '', readingTime: '', description: 'An honest future record of concepts, experiments, and questions still open.' },
]

export const hackathons = projects.slice(0, 3).map((project) => ({
  ...project,
  innovation: project.solution,
  participation: 'Project participation — add the verified event and outcome when available.',
}))

export function absoluteUrl(path = '/') {
  if (!SITE_URL) return path
  return `${SITE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export function isRealHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

export function personJsonLd() {
  const sameAs = Object.values(profile.socials).filter(isRealHttpUrl)
  const personId = absoluteUrl('/#person')
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    alternateName: profile.alternateName,
    url: absoluteUrl('/'),
    jobTitle: 'AI/ML Developer & CSE Student',
    description: profile.bio,
    address: { '@type': 'PostalAddress', addressRegion: 'West Bengal', addressCountry: 'IN' },
    affiliation: { '@type': 'CollegeOrUniversity', name: profile.education },
    sameAs,
  }
}
