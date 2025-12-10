import { test, expect } from '@playwright/test'
import { getProjectsStub, getUsersStub } from '../stubs'

test.describe('Dashboard Widgets Interaction', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API calls for dashboard data
    await page.route('*/**/projects', async (route) => {
      await route.fulfill({ json: getProjectsStub })
    })
    await page.route('*/**/users', async (route) => {
      await route.fulfill({ json: getUsersStub })
    })

    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await page.waitForSelector('#app', { state: 'visible' })
    // Wait for dashboard to fully render
    await page.waitForTimeout(2000)
  })

  test('should display all dashboard widgets correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1.page-title')).toContainText('Dashboard')

    // Verify Revenue Report card is visible
    const revenueCard = page.locator('text=Revenue Report').first()
    await expect(revenueCard).toBeVisible()

    // Verify Yearly Breakup widget is visible
    const yearlyBreakup = page.locator('text=Yearly Breakup').first()
    await expect(yearlyBreakup).toBeVisible()

    // Verify Monthly Earnings widget is visible
    const monthlyEarnings = page.locator('text=Monthly Earnings').first()
    await expect(monthlyEarnings).toBeVisible()

    // Take a screenshot of the dashboard
    await expect(page).toHaveScreenshot('dashboard-full-view.png', { fullPage: true })
  })

  test('should display data section with statistics', async ({ page }) => {
    // Wait for data section to load
    await page.waitForSelector('.flex.flex-col.gap-4', { state: 'visible' })

    // Verify data section is present
    const dataSection = page.locator('section.flex.flex-col.gap-4')
    await expect(dataSection).toBeVisible()

    // Take screenshot of data section
    await expect(page).toHaveScreenshot('dashboard-data-section.png', { fullPage: true })
  })

  test('should display revenue by location map', async ({ page }) => {
    // Wait for map widget to be visible
    await page.waitForTimeout(1000) // Allow time for map to render

    // Verify map container is present
    const mapSection = page.locator('text=Revenue by Location').first()
    await expect(mapSection).toBeVisible()

    // Take screenshot
    await expect(page).toHaveScreenshot('dashboard-location-map.png', { fullPage: true })
  })

  test('should display project table with data', async ({ page }) => {
    // Wait for project table to load
    await page.waitForTimeout(1500)

    // Verify page has loaded content
    await expect(page.locator('section.flex.flex-col.gap-4')).toBeVisible()

    // Take screenshot with longer timeout
    await expect(page).toHaveScreenshot('dashboard-project-table.png', { fullPage: true, timeout: 10000 })
  })

  test('should display timeline widget', async ({ page }) => {
    // Wait for timeline to render
    await page.waitForTimeout(500)

    // Verify timeline is visible
    const timeline = page.locator('text=Timeline').first()
    await expect(timeline).toBeVisible()

    // Take screenshot
    await expect(page).toHaveScreenshot('dashboard-timeline.png', { fullPage: true })
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Wait for page to adjust
    await page.waitForTimeout(500)

    // Verify page title is still visible
    await expect(page.locator('h1.page-title')).toBeVisible()

    // Take screenshot of mobile view
    await expect(page).toHaveScreenshot('dashboard-mobile-view.png', { fullPage: true })
  })

  test('should handle chart interactions', async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(1000)

    // Look for canvas elements (charts are rendered on canvas)
    const charts = page.locator('canvas')
    const chartCount = await charts.count()

    // Verify at least one chart is present
    expect(chartCount).toBeGreaterThan(0)

    // Take screenshot showing charts
    await expect(page).toHaveScreenshot('dashboard-with-charts.png', { fullPage: true })
  })
})
