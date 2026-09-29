import { existsSync, readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { normalizeSiteUrl } from './src/site-url.ts'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = normalizeSiteUrl(env.VITE_SITE_URL || '')
  const productionDeploy = env.REQUIRE_SITE_URL === '1' || env.VERCEL_ENV === 'production' || env.CONTEXT === 'production'
  if (productionDeploy && !siteUrl) {
    throw new Error('Production deployment requires VITE_SITE_URL. Refusing to publish a noindex site or invent a canonical domain.')
  }
  const resumePath = new URL('./public/resume.pdf', import.meta.url)
  const resumeExists = existsSync(resumePath)
  if (resumeExists && readFileSync(resumePath).subarray(0, 5).toString() !== '%PDF-') {
    throw new Error('public/resume.pdf is not a PDF. Supply the actual resume; do not rename HTML or a placeholder.')
  }
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
      __LOCAL_RESUME_AVAILABLE__: JSON.stringify(resumeExists),
    },
    build: { target: 'es2020', sourcemap: false },
  }
})
