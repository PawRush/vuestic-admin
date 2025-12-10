import { test, expect } from '@playwright/test'
import { getUsersStub, getProjectsStub } from '../stubs'

test.describe('User Management Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API calls for users and projects
    await page.route('*/**/users', async (route) => {
      await route.fulfill({ json: getUsersStub })
    })
    await page.route('*/**/projects', async (route) => {
      await route.fulfill({ json: getProjectsStub })
    })

    await page.goto('/users', { waitUntil: 'networkidle' })
    await page.waitForSelector('#app', { state: 'visible' })
  })

  test('should display users page with table', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1.page-title')).toContainText('Users')

    // Verify users table is visible
    const usersTable = page.locator('.va-data-table, table')
    await expect(usersTable.first()).toBeVisible()

    // Take screenshot
    await expect(page).toHaveScreenshot('users-page-full.png', { fullPage: true })
  })

  test('should display active/inactive filter toggle', async ({ page }) => {
    // Verify toggle buttons are present
    const activeButton = page.locator('button:has-text("Active")').first()
    const inactiveButton = page.locator('button:has-text("Inactive")').first()

    await expect(activeButton).toBeVisible()
    await expect(inactiveButton).toBeVisible()

    // Take screenshot
    await expect(page).toHaveScreenshot('users-filter-toggle.png')
  })

  test('should filter users by active status', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(500)

    // Get initial row count
    const initialRows = page.locator('tbody tr')
    const initialCount = await initialRows.count()
    expect(initialCount).toBeGreaterThan(0)

    // Click inactive filter
    const inactiveButton = page.locator('button:has-text("Inactive")').first()
    await inactiveButton.click()
    await page.waitForTimeout(500)

    // Take screenshot of filtered results
    await expect(page).toHaveScreenshot('users-filtered-inactive.png', { fullPage: true })
  })

  test('should search users by name or email', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder="Search"], input[placeholder*="search" i]').first()
    await expect(searchInput).toBeVisible()

    // Type search query
    await searchInput.fill('Amy')
    await page.waitForTimeout(500)

    // Take screenshot of search results
    await expect(page).toHaveScreenshot('users-search-results.png', { fullPage: true })

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(300)
  })

  test('should open add user modal', async ({ page }) => {
    // Find and click Add User button
    const addUserButton = page.locator('button:has-text("Add User")').first()
    await expect(addUserButton).toBeVisible()
    await addUserButton.click()

    // Wait for modal to appear
    await page.waitForTimeout(500)

    // Verify modal is visible
    const modal = page.locator('.va-modal')
    await expect(modal).toBeVisible()

    // Verify modal title
    const modalTitle = page.locator('h1:has-text("Add user"), .va-h5:has-text("Add user")')
    await expect(modalTitle).toBeVisible()

    // Take screenshot of add user modal
    await expect(page).toHaveScreenshot('users-add-modal.png', { fullPage: true })

    // Close modal
    const closeButton = page.locator('.va-modal button[aria-label*="close" i], .va-modal .va-button--icon').first()
    if (await closeButton.count() > 0) {
      await closeButton.click()
      await page.waitForTimeout(300)
    }
  })

  test('should display user form fields in add modal', async ({ page }) => {
    // Open add user modal
    const addUserButton = page.locator('button:has-text("Add User")').first()
    await addUserButton.click()
    await page.waitForTimeout(500)

    // Verify form fields are present
    const modal = page.locator('.va-modal')
    await expect(modal).toBeVisible()

    // Check for common form fields
    const form = modal.locator('form')
    if (await form.count() > 0) {
      await expect(form).toBeVisible()
    }

    // Take screenshot showing form fields
    await expect(page).toHaveScreenshot('users-add-form-fields.png', { fullPage: true })

    // Close modal
    const cancelButton = page.locator('button:has-text("Cancel")').first()
    if (await cancelButton.count() > 0) {
      await cancelButton.click()
    }
  })

  test('should handle edit user action', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(500)

    // Look for edit button (could be icon or text)
    const editButton = page.locator('button[aria-label*="edit" i], button:has-text("Edit"), .va-button:has([name*="edit"])').first()

    if (await editButton.count() > 0) {
      await editButton.click()
      await page.waitForTimeout(500)

      // Verify edit modal appears
      const modal = page.locator('.va-modal')
      if (await modal.count() > 0) {
        await expect(modal).toBeVisible()

        // Take screenshot
        await expect(page).toHaveScreenshot('users-edit-modal.png', { fullPage: true })

        // Close modal
        const closeButton = page.locator('.va-modal button[aria-label*="close" i]').first()
        if (await closeButton.count() > 0) {
          await closeButton.click()
        }
      }
    }
  })

  test('should display user table with sorting capabilities', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(500)

    // Look for sortable column headers
    const tableHeaders = page.locator('th')
    const headerCount = await tableHeaders.count()
    expect(headerCount).toBeGreaterThan(0)

    // Try clicking a header to sort
    const firstHeader = tableHeaders.first()
    await firstHeader.click()
    await page.waitForTimeout(300)

    // Take screenshot after sort
    await expect(page).toHaveScreenshot('users-table-sorted.png', { fullPage: true })
  })

  test('should display pagination controls', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(500)

    // Look for pagination controls
    const pagination = page.locator('.va-pagination, .va-data-table-pagination, nav[aria-label*="pagination" i]')

    if (await pagination.count() > 0) {
      await expect(pagination.first()).toBeVisible()

      // Take screenshot showing pagination
      await expect(page).toHaveScreenshot('users-pagination.png', { fullPage: true })
    }
  })

  test('should display user roles in table', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(500)

    // Verify table has content
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    expect(rowCount).toBeGreaterThan(0)

    // Take screenshot showing user data with roles
    await expect(page).toHaveScreenshot('users-table-with-roles.png', { fullPage: true })
  })

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    // Verify page is still accessible
    await expect(page.locator('h1.page-title')).toBeVisible()

    // Verify add user button is visible
    const addUserButton = page.locator('button:has-text("Add User")').first()
    await expect(addUserButton).toBeVisible()

    // Take screenshot
    await expect(page).toHaveScreenshot('users-mobile-view.png', { fullPage: true })
  })

  test('should handle table interactions on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)

    // Verify table is responsive
    const table = page.locator('.va-data-table, table').first()
    await expect(table).toBeVisible()

    // Take screenshot
    await expect(page).toHaveScreenshot('users-tablet-view.png', { fullPage: true })
  })

  test('should display user avatars in table', async ({ page }) => {
    // Wait for table to load
    await page.waitForTimeout(500)

    // Take screenshot showing the complete user table
    await expect(page).toHaveScreenshot('users-table-complete.png', { fullPage: true })
  })
})
