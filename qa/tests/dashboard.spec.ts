import { test, expect } from '@playwright/test';
import { generateUniqueEmail } from '../fixtures/test-base';

test.describe('Dashboard - Protected Access', () => {
  test('should redirect to login page without authorization', async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();

    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });
});

test.describe('Dashboard - Authenticated User', () => {
  let uniqueEmail: string;

  test.beforeEach(async ({ page }) => {
    // Register a new user for each test
    uniqueEmail = generateUniqueEmail();

    await page.goto('/register');
    await page.locator('#firstName').fill('Test');
    await page.locator('#lastName').fill('User');
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('testpassword123');
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    // Wait for dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should display dashboard with user profile', async ({ page }) => {
    // Check page header
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // Check welcome message
    await expect(page.getByText(/Witaj,.*!/)).toBeVisible();

    // Check profile section exists
    await expect(page.getByRole('heading', { name: 'Twój profil' })).toBeVisible();
  });

  test('should display account balance section', async ({ page }) => {
    // Check balance section exists
    await expect(page.getByRole('heading', { name: 'Stan konta' })).toBeVisible();
  });

  test('should display user profile information', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Check profile section
    const profileSection = page.locator('section', { has: page.getByRole('heading', { name: 'Twój profil' }) });
    await expect(profileSection).toBeVisible();

    // Profile should show user data (waiting for API response)
    await expect(page.getByText('Imię')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Nazwisko')).toBeVisible();
    await expect(page.getByText('E-mail')).toBeVisible();
  });

  test('should have edit profile button', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Wait for profile to load
    await expect(page.getByRole('heading', { name: 'Twój profil' })).toBeVisible();

    // Check for edit button
    const editButton = page.getByRole('button', { name: 'Edytuj' });
    await expect(editButton).toBeVisible({ timeout: 10000 });
  });

  test('should open edit form when clicking edit button', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Wait for profile to load and click edit
    await expect(page.getByRole('heading', { name: 'Twój profil' })).toBeVisible();

    const editButton = page.getByRole('button', { name: 'Edytuj' });
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Check that form inputs are visible
    await expect(page.locator('input#firstName')).toBeVisible();
    await expect(page.locator('input#lastName')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();

    // Check for save and cancel buttons
    await expect(page.getByRole('button', { name: 'Zapisz zmiany' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Anuluj' })).toBeVisible();
  });

  test('should cancel edit mode', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Enter edit mode
    const editButton = page.getByRole('button', { name: 'Edytuj' });
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Click cancel
    await page.getByRole('button', { name: 'Anuluj' }).click();

    // Edit button should be visible again (not in edit mode)
    await expect(page.getByRole('button', { name: 'Edytuj' })).toBeVisible();
  });

  test('should navigate using navbar links', async ({ page }) => {
    // Check navbar is present
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Check Bank CDV logo link
    await expect(page.getByRole('link', { name: 'Bank CDV' })).toBeVisible();

    // Check Dashboard link is current
    const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    // Check Users link
    await expect(page.getByRole('link', { name: /Użytkownicy/ })).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: 'Wyloguj' });
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });

  test('should not access dashboard after logout', async ({ page }) => {
    // Logout
    await page.getByRole('button', { name: 'Wyloguj' }).click();
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });

    // Try to access dashboard
    await page.goto('/dashboard');

    // Should redirect back to login
    await expect(page).toHaveURL(/.*\/login/, { timeout: 10000 });
  });
});

test.describe('Dashboard - Profile Edit', () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();

    await page.goto('/register');
    await page.locator('#firstName').fill('Original');
    await page.locator('#lastName').fill('Name');
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('testpassword123');
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should show validation error when editing with empty fields', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Enter edit mode
    const editButton = page.getByRole('button', { name: 'Edytuj' });
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Clear required field
    await page.locator('input#firstName').clear();

    // Try to save
    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    // Should show error
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('should save profile changes', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Enter edit mode
    const editButton = page.getByRole('button', { name: 'Edytuj' });
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Change first name
    await page.locator('input#firstName').clear();
    await page.locator('input#firstName').fill('Updated');

    // Save changes
    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    // Should exit edit mode and show updated name
    await expect(page.getByRole('button', { name: 'Edytuj' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Updated')).toBeVisible();
  });
});

test.describe('Dashboard - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();

    await page.goto('/register');
    await page.locator('#firstName').fill('Test');
    await page.locator('#lastName').fill('User');
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('testpassword123');
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should have skip link for keyboard navigation', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a', { hasText: 'Przejdź do głównej treści' });
    await expect(skipLink).toBeAttached();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check h1 exists
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check h2 sections exist
    const h2Headings = page.getByRole('heading', { level: 2 });
    await expect(h2Headings.first()).toBeVisible();
  });

  test('should have proper ARIA labels on navigation', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Nawigacja główna"]');
    await expect(nav).toBeVisible();
  });

  test('should have main content landmark', async ({ page }) => {
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });
});
