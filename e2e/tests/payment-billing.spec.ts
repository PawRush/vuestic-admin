import { test, expect } from '@playwright/test'

test.describe('Payment and Billing Pages', () => {
  test.describe('Payment Methods Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/payments/payment-methods', { waitUntil: 'networkidle' })
      await page.waitForSelector('#app', { state: 'visible' })
    })

    test('should display payment methods page', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1.page-title')).toContainText('Payment methods')

      // Verify page has loaded
      await expect(page.locator('.va-card').first()).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-methods-full.png', { fullPage: true })
    })

    test('should display my cards section', async ({ page }) => {
      // Verify "My cards" heading
      const myCardsHeading = page.locator('text=My cards').first()
      await expect(myCardsHeading).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-my-cards-section.png', { fullPage: true })
    })

    test('should display billing address section', async ({ page }) => {
      // Verify "Billing address" heading
      const billingHeading = page.locator('text=Billing address').first()
      await expect(billingHeading).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-billing-address-section.png', { fullPage: true })
    })

    test('should display tax location information', async ({ page }) => {
      // Verify tax location section
      const taxLocation = page.locator('text=Tax location').first()
      await expect(taxLocation).toBeVisible()

      // Verify tax info is displayed
      const taxInfo = page.locator('text=VAT, text=United States').first()
      if (await taxInfo.count() > 0) {
        await expect(taxInfo).toBeVisible()
      }

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-tax-location.png', { fullPage: true })
    })

    test('should handle add payment card action', async ({ page }) => {
      // Look for add card button
      const addCardButton = page.locator('button:has-text("Add"), button:has-text("add"), button:has([name*="add"])').first()

      if (await addCardButton.count() > 0) {
        await addCardButton.click()
        await page.waitForTimeout(500)

        // Check if modal appeared
        const modal = page.locator('.va-modal')
        if (await modal.count() > 0) {
          await expect(modal).toBeVisible()

          // Take screenshot
          await expect(page).toHaveScreenshot('payment-add-card-modal.png', { fullPage: true })

          // Close modal
          const closeButton = page.locator('.va-modal button[aria-label*="close" i]').first()
          if (await closeButton.count() > 0) {
            await closeButton.click()
          }
        }
      }
    })

    test('should display payment cards list', async ({ page }) => {
      // Wait for cards to load
      await page.waitForTimeout(500)

      // Take screenshot showing cards
      await expect(page).toHaveScreenshot('payment-cards-list.png', { fullPage: true })
    })

    test('should display billing addresses list', async ({ page }) => {
      // Scroll to billing section
      await page.evaluate(() => {
        const billingSection = document.querySelector('text=Billing address')
        if (billingSection) {
          billingSection.scrollIntoView({ behavior: 'smooth' })
        }
      })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-billing-addresses-list.png', { fullPage: true })
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)

      // Verify page is accessible
      await expect(page.locator('h1.page-title')).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-methods-mobile.png', { fullPage: true })
    })
  })

  test.describe('Billing Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/payments/billing', { waitUntil: 'networkidle' })
      await page.waitForSelector('#app', { state: 'visible' })
    })

    test('should display billing page', async ({ page }) => {
      // Verify page has loaded
      await expect(page.locator('#app')).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('billing-page-full.png', { fullPage: true })
    })

    test('should display billing information sections', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(500)

      // Take screenshot showing billing sections
      await expect(page).toHaveScreenshot('billing-sections.png', { fullPage: true })
    })

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('billing-tablet-view.png', { fullPage: true })
    })
  })

  test.describe('Pricing Plans Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/payments/pricing-plans', { waitUntil: 'networkidle' })
      await page.waitForSelector('#app', { state: 'visible' })
    })

    test('should display pricing plans page', async ({ page }) => {
      // Verify page has loaded
      await expect(page.locator('#app')).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('pricing-plans-full.png', { fullPage: true })
    })

    test('should display pricing plan cards', async ({ page }) => {
      // Wait for pricing cards to load
      await page.waitForTimeout(500)

      // Look for pricing plan elements
      const cards = page.locator('.va-card')
      if (await cards.count() > 0) {
        await expect(cards.first()).toBeVisible()
      }

      // Take screenshot
      await expect(page).toHaveScreenshot('pricing-plans-cards.png', { fullPage: true })
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('pricing-plans-mobile.png', { fullPage: true })
    })
  })

  test.describe('Main Payments Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/payments', { waitUntil: 'networkidle' })
      await page.waitForSelector('#app', { state: 'visible' })
    })

    test('should display main payments page', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1.page-title')).toContainText('Payment')

      // Take screenshot
      await expect(page).toHaveScreenshot('payments-main-page.png', { fullPage: true })
    })

    test('should display payment cards section', async ({ page }) => {
      // Wait for content
      await page.waitForTimeout(500)

      // Verify cards are visible
      const cards = page.locator('.va-card')
      await expect(cards.first()).toBeVisible()

      // Take screenshot
      await expect(page).toHaveScreenshot('payments-cards-overview.png', { fullPage: true })
    })

    test('should navigate between payment sections', async ({ page }) => {
      // Take initial screenshot
      await expect(page).toHaveScreenshot('payments-initial-view.png', { fullPage: true })

      // If there are tabs or navigation, test them
      const tabs = page.locator('[role="tab"], .va-tabs__tab')
      if (await tabs.count() > 0) {
        // Click second tab if exists
        const secondTab = tabs.nth(1)
        await secondTab.click()
        await page.waitForTimeout(500)

        // Take screenshot after navigation
        await expect(page).toHaveScreenshot('payments-second-tab.png', { fullPage: true })
      }
    })

    test('should handle payment card interactions', async ({ page }) => {
      // Wait for cards to load
      await page.waitForTimeout(500)

      // Look for interactive elements
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      expect(buttonCount).toBeGreaterThan(0)

      // Take screenshot
      await expect(page).toHaveScreenshot('payments-interactive-elements.png', { fullPage: true })
    })

    test('should display payment methods summary', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(500)

      // Take comprehensive screenshot
      await expect(page).toHaveScreenshot('payments-summary.png', { fullPage: true })
    })

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('payments-tablet-view.png', { fullPage: true })
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('payments-mobile-view.png', { fullPage: true })
    })
  })

  test.describe('Payment Flow Integration', () => {
    test('should navigate through complete payment flow', async ({ page }) => {
      // Start at main payments page
      await page.goto('/payments', { waitUntil: 'networkidle' })
      await page.waitForSelector('#app', { state: 'visible' })
      await page.waitForTimeout(500)

      // Take screenshot of starting point
      await expect(page).toHaveScreenshot('payment-flow-start.png', { fullPage: true })

      // Navigate to payment methods
      await page.goto('/payments/payment-methods')
      await page.waitForSelector('#app', { state: 'visible' })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-flow-methods.png', { fullPage: true })

      // Navigate to billing
      await page.goto('/payments/billing')
      await page.waitForSelector('#app', { state: 'visible' })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-flow-billing.png', { fullPage: true })

      // Navigate to pricing plans
      await page.goto('/payments/pricing-plans')
      await page.waitForSelector('#app', { state: 'visible' })
      await page.waitForTimeout(500)

      // Take screenshot
      await expect(page).toHaveScreenshot('payment-flow-pricing.png', { fullPage: true })
    })
  })
})
