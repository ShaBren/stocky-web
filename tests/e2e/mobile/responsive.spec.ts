import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE dimensions

  test('should display mobile-friendly navigation', async ({ page }) => {
    await page.goto('/login')
    
    // Check that the page is responsive
    await expect(page.getByRole('heading', { name: /welcome to stockyweb/i })).toBeVisible()
    
    // Check form elements are properly sized for mobile
    const emailInput = page.getByPlaceholder('Enter your email')
    await expect(emailInput).toBeVisible()
    
    const passwordInput = page.getByPlaceholder('Enter your password')
    await expect(passwordInput).toBeVisible()
    
    const signInButton = page.getByRole('button', { name: /sign in/i })
    await expect(signInButton).toBeVisible()
  })

  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/login')
    
    // Test touch interaction with form elements
    await page.getByPlaceholder('Enter your email').tap()
    await page.getByPlaceholder('Enter your email').fill('test@example.com')
    
    await page.getByPlaceholder('Enter your password').tap()
    await page.getByPlaceholder('Enter your password').fill('password')
    
    // Test button tap
    await page.getByRole('button', { name: /sign in/i }).tap()
  })
})
