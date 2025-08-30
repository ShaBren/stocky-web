import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/)
    
    // Check for login form elements
    await expect(page.getByRole('heading', { name: /welcome to stockyweb/i })).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should handle login form validation', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Check for validation messages (if implemented)
    // This test would need to be updated based on actual validation implementation
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials
    await page.getByPlaceholder('Enter your email').fill('invalid@example.com')
    await page.getByPlaceholder('Enter your password').fill('wrongpassword')
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show error message (when API integration is complete)
    // This would be updated based on actual error handling
  })

  test('should navigate to dashboard after successful login', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in valid credentials (matching MSW mock)
    await page.getByPlaceholder('Enter your email').fill('admin@example.com')
    await page.getByPlaceholder('Enter your password').fill('password')
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should redirect to dashboard (when auth is implemented)
    // await expect(page).toHaveURL(/.*\/dashboard/)
    // await expect(page.getByText('Dashboard')).toBeVisible()
  })
})
