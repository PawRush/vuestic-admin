import { test, expect } from '@playwright/test'

test.describe('Theme Switching Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' })
    await page.waitForSelector('#app', { state: 'visible' })
  })

  test('should display theme toggle buttons', async ({ page }) => {
    // Wait for theme switcher to load
    await page.waitForSelector('.va-button-toggle', { state: 'visible' })

    // Verify both theme buttons are present
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    const lightButton = page.locator('button:has-text("Light"), button:has-text("light")').first()

    await expect(darkButton).toBeVisible()
    await expect(lightButton).toBeVisible()

    // Take screenshot
    await expect(page).toHaveScreenshot('theme-switcher-initial.png', { fullPage: true })
  })

  test('should switch to dark theme', async ({ page }) => {
    // Wait for theme switcher
    await page.waitForSelector('.va-button-toggle', { state: 'visible' })

    // Get initial background color
    const initialBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Click dark theme button
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    await darkButton.click()
    await page.waitForTimeout(500) // Allow theme transition

    // Get new background color
    const newBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Verify background color changed (dark theme should have darker background)
    expect(initialBgColor).not.toBe(newBgColor)

    // Take screenshot of dark theme
    await expect(page).toHaveScreenshot('theme-dark-mode.png', { fullPage: true })
  })

  test('should switch to light theme', async ({ page }) => {
    // First ensure we're in dark mode
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    await darkButton.click()
    await page.waitForTimeout(500)

    // Get dark mode background
    const darkBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Click light theme button
    const lightButton = page.locator('button:has-text("Light"), button:has-text("light")').first()
    await lightButton.click()
    await page.waitForTimeout(500) // Allow theme transition

    // Get new background color
    const lightBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Verify background color changed
    expect(darkBgColor).not.toBe(lightBgColor)

    // Take screenshot of light theme
    await expect(page).toHaveScreenshot('theme-light-mode.png', { fullPage: true })
  })

  test('should persist theme across page navigation', async ({ page }) => {
    // Switch to dark theme
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    await darkButton.click()
    await page.waitForTimeout(500)

    // Get background color after switching to dark
    const darkBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForSelector('#app', { state: 'visible' })
    await page.waitForTimeout(500)

    // Get background color on dashboard
    const dashboardBgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })

    // Verify theme persisted (colors should be similar - dark theme)
    expect(dashboardBgColor).toBe(darkBgColor)

    // Take screenshot of dashboard in dark theme
    await expect(page).toHaveScreenshot('theme-dashboard-dark.png', { fullPage: true })
  })

  test('should apply theme to all components on dashboard', async ({ page }) => {
    // Switch to dark theme
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    await darkButton.click()
    await page.waitForTimeout(500)

    // Navigate to dashboard
    await page.goto('/dashboard')
    await page.waitForSelector('#app', { state: 'visible' })
    await page.waitForTimeout(1000)

    // Verify cards have appropriate styling
    const cards = page.locator('.va-card')
    const cardCount = await cards.count()
    expect(cardCount).toBeGreaterThan(0)

    // Take full page screenshot showing themed components
    await expect(page).toHaveScreenshot('theme-dark-dashboard-full.png', { fullPage: true })
  })

  test('should apply theme to users page', async ({ page }) => {
    // Switch to light theme first
    const lightButton = page.locator('button:has-text("Light"), button:has-text("light")').first()
    await lightButton.click()
    await page.waitForTimeout(500)

    // Navigate to users page with mocked data
    await page.route('*/**/users', async (route) => {
      await route.fulfill({
        json: [
          { id: '1', fullname: 'Test User', email: 'test@example.com', role: 'user', active: true },
        ],
      })
    })

    await page.goto('/users')
    await page.waitForSelector('#app', { state: 'visible' })
    await page.waitForTimeout(500)

    // Take screenshot of users page with light theme
    await expect(page).toHaveScreenshot('theme-light-users-page.png', { fullPage: true })
  })

  test('should apply theme to payments page', async ({ page }) => {
    // Switch to dark theme
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    await darkButton.click()
    await page.waitForTimeout(500)

    // Navigate to payments page
    await page.goto('/payments')
    await page.waitForSelector('#app', { state: 'visible' })
    await page.waitForTimeout(500)

    // Take screenshot of payments page with dark theme
    await expect(page).toHaveScreenshot('theme-dark-payments-page.png', { fullPage: true })
  })

  test('should toggle theme multiple times without errors', async ({ page }) => {
    // Toggle between themes multiple times
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    const lightButton = page.locator('button:has-text("Light"), button:has-text("light")').first()

    // Click dark
    await darkButton.click()
    await page.waitForTimeout(300)

    // Click light
    await lightButton.click()
    await page.waitForTimeout(300)

    // Click dark again
    await darkButton.click()
    await page.waitForTimeout(300)

    // Click light again
    await lightButton.click()
    await page.waitForTimeout(300)

    // Verify page is still functioning
    await expect(page.locator('h1.page-title')).toBeVisible()

    // Take final screenshot
    await expect(page).toHaveScreenshot('theme-after-multiple-toggles.png', { fullPage: true })
  })

  test('should apply theme correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Switch to dark theme
    const darkButton = page.locator('button:has-text("Dark"), button:has-text("dark")').first()
    await darkButton.click()
    await page.waitForTimeout(500)

    // Take screenshot
    await expect(page).toHaveScreenshot('theme-dark-mobile.png', { fullPage: true })

    // Switch to light theme
    const lightButton = page.locator('button:has-text("Light"), button:has-text("light")').first()
    await lightButton.click()
    await page.waitForTimeout(500)

    // Take screenshot
    await expect(page).toHaveScreenshot('theme-light-mobile.png', { fullPage: true })
  })
})
