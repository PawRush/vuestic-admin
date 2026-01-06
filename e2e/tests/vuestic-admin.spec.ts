import { test, expect } from '@playwright/test'

const pages = [
  { name: 'Dashboard', url: '/dashboard' },
  { name: 'Settings', url: '/settings' },
  { name: 'Preferences', url: '/preferences' },
  { name: 'Users', url: '/users' },
  { name: 'Projects', url: '/projects' },
  { name: 'Payments', url: '/payments' },
  { name: 'Payment Methods', url: '/payments/payment-methods' },
  { name: 'Billing', url: '/payments/billing' },
  { name: 'Pricing Plans', url: '/payments/pricing-plans' },
  { name: 'FAQ', url: '/faq' },
  { name: 'Login', url: '/auth/login' },
  { name: 'Sign Up', url: '/auth/signup' },
  { name: 'Recover Password', url: '/auth/recover-password' },
  { name: '404', url: '/404' },
]

for (const { name, url } of pages) {
  test(`${name} page loads`, async ({ page }) => {
    await page.goto(url)
    await expect(page.locator('#app')).toBeVisible()
  })
}

test.describe('Basic functionality', () => {
  test('sidebar navigation works', async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('.va-sidebar').getByText('Users').click()
    await expect(page).toHaveURL('/users')
    await expect(page.locator('h1')).toContainText('Users')
  })

  test('theme toggle switches theme', async ({ page }) => {
    await page.goto('/settings')
    const body = page.locator('body')
    const initialBg = await body.evaluate((el) => getComputedStyle(el).backgroundColor)

    await page.getByRole('button', { name: /dark/i }).click()
    const darkBg = await body.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(darkBg).not.toBe(initialBg)
  })

  test('login form validation', async ({ page }) => {
    await page.goto('/auth/login')
    await page.getByRole('button', { name: /login/i }).click()
    // Form should show validation errors for empty fields
    await expect(page.locator('.va-input-wrapper--error').first()).toBeVisible()
  })

  test('FAQ page has questions', async ({ page }) => {
    await page.goto('/faq')
    await expect(page.getByText('Popular questions')).toBeVisible()
    await expect(page.getByText('How do I reload a page?')).toBeVisible()
  })
})
