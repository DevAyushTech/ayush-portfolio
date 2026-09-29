import { spawnSync } from 'node:child_process'

// npm.cmd needs a shell on Windows. All arguments are fixed, not user input.
const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, REQUIRE_SITE_URL: '1' },
})
if (result.error) console.error(result.error.message)
process.exit(result.status ?? 1)
