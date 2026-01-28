import { test as base, expect, Page } from '@playwright/test';

// Test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
};

// Extended test fixture with authentication helpers
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    await loginAsTestUser(page);
    await use(page);
  },
});

/**
 * Login as test user
 * Navigates to login page and performs login with test credentials
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Fill login form
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);

  // Submit form
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Register a new test user
 * @param page Playwright page
 * @param userData User data for registration
 */
export async function registerTestUser(
  page: Page,
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  } = TEST_USER
): Promise<void> {
  await page.goto('/register');
  await page.waitForLoadState('networkidle');

  // Fill registration form
  await page.locator('#firstName').fill(userData.firstName);
  await page.locator('#lastName').fill(userData.lastName);
  await page.locator('#email').fill(userData.email);
  await page.locator('#password').fill(userData.password);

  // Submit form
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Logout from the application
 */
export async function logout(page: Page): Promise<void> {
  // Click logout button in navbar
  await page.getByRole('button', { name: 'Wyloguj' }).click();

  // Wait for redirect to login
  await page.waitForURL('**/login', { timeout: 10000 });
}

/**
 * Generate unique email for test user
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  return `test-${timestamp}@example.com`;
}

export { expect };
