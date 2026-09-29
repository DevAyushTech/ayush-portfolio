import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const edge = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4174',
    headless: true,
    launchOptions: { executablePath: process.env.BROWSER_PATH || (existsSync(edge) ? edge : undefined) },
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
  },
})
