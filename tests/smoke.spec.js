import { test, expect } from '@playwright/test'

test.describe('FITKART production smoke tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/FITKART/i)

    await expect(
      page.getByRole('link', { name: /FITKART/i }).first()
    ).toBeVisible()
  })

  test('products page loads successfully', async ({ page }) => {
    await page.goto('/products')

    await expect(
      page.getByRole('heading', { name: /products/i }).first()
    ).toBeVisible()
  })

  test('product details page can be opened', async ({ page }) => {
    await page.goto('/products')

    const productLink = page.locator('a[href^="/products/"]').first()

    await expect(productLink).toBeVisible()

    await productLink.click()

    await expect(page).toHaveURL(/\/products\/\d+/)
  })

  test('login page loads successfully', async ({ page }) => {
    await page.goto('/login')

    await expect(
      page.getByRole('heading', { name: /login/i }).first()
    ).toBeVisible()
  })

  test('unauthenticated customer route redirects to login', async ({ page }) => {
    await page.goto('/cart')

    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated admin route redirects to login', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/login/)
  })
})
