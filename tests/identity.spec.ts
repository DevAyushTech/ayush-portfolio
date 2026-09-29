import { test, expect } from '@playwright/test'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

const socials = {
  github: 'https://github.com/DevAyushTech',
  linkedin: 'https://www.linkedin.com/in/connect-ayushsingh/',
  instagram: 'https://www.instagram.com/be.aayushh/',
}
const email = 'mailto:connect.ayushkumarsingh@gmail.com'
const description = 'Ayush Kumar Singh, also known as Ayush Singh, is a Computer Science & Engineering student specializing in Artificial Intelligence & Machine Learning, building AI, full-stack and experimental technology projects.'

test.beforeEach(async ({ page }) => {
  // Isolate UI tests from API rate limits and external font-network availability.
  // Empty responses are test-only; production always uses the live public API.
  await page.route('https://api.github.com/**', route => route.fulfill({ json: [] }))
  await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ contentType: 'text/css', body: '' }))
})

for (const width of [360, 390, 768, 1440]) {
  test(`identity and exact social links at ${width}px`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Ayush Kumar Singh')
    await expect(page.locator('.alternate-name')).toHaveText('Also known as Ayush Singh')
    await expect(page).toHaveTitle('Ayush Kumar Singh | AI/ML Developer & CSE Student')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', description)
    const schema = await page.locator('#identity-schema').textContent()
    const person = JSON.parse(schema!)['@graph'].find((entry: { '@type': string }) => entry['@type'] === 'Person')
    expect(person.name).toBe('Ayush Kumar Singh')
    expect(person.alternateName).toBe('Ayush Singh')
    expect(person.sameAs).toEqual(Object.values(socials))
    expect(JSON.parse(schema!)['@graph'].some((entry: { '@type': string }) => entry['@type'] === 'Article')).toBeFalsy()
    for (const selector of ['.hero', '.profile-socials', '.github-socials', '.contact', '.footer-socials']) {
      for (const url of Object.values(socials)) {
        const link = page.locator(selector).locator(`a[href="${url}"]`).first()
        await expect(link).toBeAttached()
        await expect(link).toHaveAttribute('target', '_blank')
        await expect(link).toHaveAttribute('rel', /noreferrer/)
      }
    }
    await expect(page.locator(`.hero a[href="${email}"]`)).toBeVisible()
    if (width <= 640) {
      await page.getByRole('button', { name: 'Open menu', exact: true }).click()
      for (const url of Object.values(socials)) await expect(page.locator(`.mobile-socials a[href="${url}"]`)).toBeVisible()
      await page.getByRole('button', { name: 'Close menu', exact: true }).click()
    } else {
      for (const url of Object.values(socials)) await expect(page.locator(`.header-social-links a[href="${url}"]`)).toBeVisible()
    }
    for (const selector of ['.hero h1', '.hero-copy', '.header-actions', '.profile-socials']) {
      const box = await page.locator(selector).first().boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
    expect(errors).toEqual([])
    await page.screenshot({ path: `test-results/identity-${width}.png` })
  })
}

test('client navigation updates canonical, description, social cards and JSON-LD', async ({ page }) => {
  await page.goto('/')
  await page.locator('.desktop-nav').getByRole('link', { name: 'Work', exact: true }).click()
  await expect(page).toHaveURL(/\/projects$/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/projects$/)
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /\/projects$/)
  await page.locator('.project-index-card').first().click()
  await expect(page).toHaveURL(/\/projects\/auto-escrow$/)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /intelligent escrow/)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/projects\/auto-escrow$/)
  await expect(page.locator('#identity-schema')).toHaveCount(1)
  expect(await page.locator('#identity-schema').textContent()).toContain('CreativeWork')
  await page.goBack()
  await expect(page).toHaveURL(/\/projects$/)
  expect(await page.locator('#identity-schema').textContent()).not.toContain('CreativeWork')
  await page.goto('/contact')
  await expect(page.locator(`.public-email[href="${email}"]`)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open email draft' })).toBeVisible()
})

test('real PDF is served unchanged and view/download actions use it', async ({ page, request }) => {
  test.skip(!existsSync('public/resume.pdf'), 'Owner PDF not yet supplied; /resume.pdf is the documented placeholder.')
  const original = readFileSync('public/resume.pdf')
  expect(original.subarray(0, 5).toString()).toBe('%PDF-')
  const response = await request.get('/resume.pdf')
  expect(response.ok()).toBeTruthy()
  expect(response.headers()['content-type']).toContain('application/pdf')
  const body = await response.body()
  expect(createHash('sha256').update(body).digest('hex')).toBe(createHash('sha256').update(original).digest('hex'))
  await page.goto('/resume')
  const view = page.getByRole('link', { name: 'View Resume', exact: true })
  await expect(view).toHaveAttribute('href', '/resume.pdf')
  await expect(view).toHaveAttribute('target', '_blank')
  const download = page.getByRole('link', { name: 'Download Resume', exact: true })
  await expect(download).toHaveAttribute('download', 'Ayush-Kumar-Singh-Resume.pdf')
  const downloaded = page.waitForEvent('download')
  await download.click()
  const file = await downloaded
  expect(file.suggestedFilename()).toBe('Ayush-Kumar-Singh-Resume.pdf')
  const downloadedPath = await file.path()
  expect(createHash('sha256').update(readFileSync(downloadedPath!)).digest('hex')).toBe(createHash('sha256').update(original).digest('hex'))
  await expect(page.locator('.resume-panel')).not.toContainText('awaiting upload')
})
