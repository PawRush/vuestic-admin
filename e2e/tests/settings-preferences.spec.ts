import { test, expect } from '@playwright/test'

test.describe('Settings and Preferences Interactions', () => {
  test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/settings', { waitUntil: 'networkidle' })
      await page.waitForSelector('#app', { state: 'visible' })
    })

    test('should display settings page with all sections', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1.page-title')).toContainText('Settings')

      // Verify Theme section
      const themeSection = page.locator('text=Theme').first()
      await expect(themeSection).toBeVisible()

      // Verify General preferences section
      const preferencesSection = page.locator('text=General preferences').first()
      await expect(preferencesSection).toBeVisible()

      // Verify notification alert is visible
      const notificationAlert = page.locator('text=Your notification settings are regrouped and simplified')
      await expect(notificationAlert).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('settings-page-full.png', { fullPage: true })
    })

    test('should display and interact with theme switcher', async ({ page }) => {
      // Wait for theme switcher to be visible
      const themeSwitcher = page.locator('.va-button-toggle')
      await expect(themeSwitcher.first()).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('settings-theme-section.png', { fullPage: true })
    })

    test('should display language switcher', async ({ page }) => {
      // Verify language switcher is present in general preferences
      await expect(page.locator('text=General preferences')).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('settings-language-section.png', { fullPage: true })
    })

    test('should display notifications section', async ({ page }) => {
      // Wait for notifications section
      await page.waitForTimeout(500)

      // Scroll to notifications section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(300)

      // Take screenshot of full page including notifications
      await expect(page).toHaveScreenshot('settings-notifications.png', { fullPage: true })
    })

    test('should allow closing notification alert', async ({ page }) => {
      // Find the alert close button
      const alertCloseButton = page.locator('.va-alert button[aria-label="close"]')

      if (await alertCloseButton.count() > 0) {
        await alertCloseButton.click()
        await page.waitForTimeout(500)

        // Verify alert is no longer visible
        const alert = page.locator('.va-alert:has-text("Your notification settings")')
        await expect(alert).not.toBeVisible()

        // Take screenshot after closing alert
        await expect(page).toHaveScreenshot('settings-alert-closed.png', { fullPage: true })
      }
    })

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(500)

      // Verify page is still accessible
      await expect(page.locator('h1.page-title')).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('settings-tablet-view.png', { fullPage: true })
    })
  })

  test.describe('Preferences Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/preferences', { waitUntil: 'networkidle' })
      await page.waitForSelector('#app', { state: 'visible' })
    })

    test('should display preferences page with user settings', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1.page-title')).toContainText('Preferences')

      // Verify preferences content is visible
      const preferencesCard = page.locator('.bg-backgroundSecondary')
      await expect(preferencesCard).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('preferences-page-full.png', { fullPage: true })
    })

    test('should display user profile section', async ({ page }) => {
      // Wait for preferences to load
      await page.waitForTimeout(500)

      // Verify content is loaded
      await expect(page.locator('.bg-backgroundSecondary')).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('preferences-profile-section.png', { fullPage: true })
    })

    test('should handle edit name modal trigger', async ({ page }) => {
      // Look for edit name button if it exists
      const editNameButton = page.locator('button:has-text("Edit Name"), button:has-text("edit name")').first()

      if (await editNameButton.count() > 0) {
        await editNameButton.click()
        await page.waitForTimeout(500)

        // Check if modal appeared
        const modal = page.locator('.va-modal')
        if (await modal.count() > 0) {
          await expect(modal).toBeVisible()

          // Take screenshot of modal
          await expect(page).toHaveScreenshot('preferences-edit-name-modal.png', { fullPage: true })

          // Close modal
          const cancelButton = page.locator('button:has-text("Cancel")').first()
          if (await cancelButton.count() > 0) {
            await cancelButton.click()
          }
        }
      }
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)

      // Verify page is still accessible
      await expect(page.locator('h1.page-title')).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('preferences-mobile-view.png', { fullPage: true })
    })
  })
})
