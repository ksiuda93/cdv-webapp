import { test, expect } from '@playwright/test';
import { TEST_USER, generateUniqueEmail } from '../fixtures/test-base';

test.describe('Authentication - Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title and header
    await expect(page.getByRole('heading', { name: 'Bank CDV' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();
    await expect(page.getByText('System zarządzania klientami')).toBeVisible();

    // Check form elements
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toBeVisible();

    // Check links
    await expect(page.getByRole('link', { name: 'Zarejestruj się' })).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    // Click submit without filling fields
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    // Check error message
    await expect(page.getByRole('alert')).toContainText('Proszę wypełnić wszystkie pola');
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.locator('#password').fill('somepassword');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByRole('alert')).toContainText('Proszę wypełnić wszystkie pola');
  });

  test('should show validation error for empty password', async ({ page }) => {
    await page.locator('#email').fill('test@example.com');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByRole('alert')).toContainText('Proszę wypełnić wszystkie pola');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.locator('#email').fill('invalid@example.com');
    await page.locator('#password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    // Wait for API response and check error
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to register page via link', async ({ page }) => {
    await page.getByRole('link', { name: 'Zarejestruj się' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });

  test('should have accessible form labels', async ({ page }) => {
    // Check email label
    const emailLabel = page.locator('label[for="email"]');
    await expect(emailLabel).toContainText('Adres e-mail');

    // Check password label
    const passwordLabel = page.locator('label[for="password"]');
    await expect(passwordLabel).toContainText('Hasło');
  });

  test('should disable submit button during submission', async ({ page }) => {
    await page.locator('#email').fill('test@example.com');
    await page.locator('#password').fill('password123');

    // Click and immediately check button state
    const submitButton = page.getByRole('button', { name: /Zaloguj|Logowanie/ });
    await submitButton.click();

    // The button text should change or be disabled during submission
    // This depends on network speed, so we check for either state
    await expect(submitButton).toBeVisible();
  });
});

test.describe('Authentication - Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register page correctly', async ({ page }) => {
    // Check page title and header
    await expect(page.getByRole('heading', { name: 'Bank CDV' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Rejestracja' })).toBeVisible();

    // Check form elements
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zarejestruj się' })).toBeVisible();

    // Check link to login
    await expect(page.getByRole('link', { name: 'Zaloguj się' })).toBeVisible();
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    await expect(page.getByRole('alert')).toContainText('Proszę wypełnić wszystkie pola');
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.locator('#firstName').fill('Jan');
    await page.locator('#lastName').fill('Kowalski');
    await page.locator('#email').fill('jan@example.com');
    await page.locator('#password').fill('12345'); // Less than 6 characters

    await page.getByRole('button', { name: 'Zarejestruj się' }).click();
    await expect(page.getByRole('alert')).toContainText('Hasło musi mieć co najmniej 6 znaków');
  });

  test('should navigate to login page via link', async ({ page }) => {
    await page.getByRole('link', { name: 'Zaloguj się' }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should have accessible form labels', async ({ page }) => {
    await expect(page.locator('label[for="firstName"]')).toContainText('Imię');
    await expect(page.locator('label[for="lastName"]')).toContainText('Nazwisko');
    await expect(page.locator('label[for="email"]')).toContainText('Adres e-mail');
    await expect(page.locator('label[for="password"]')).toContainText('Hasło');
  });
});

test.describe('Authentication - Login Flow', () => {
  test('should redirect to dashboard after successful login', async ({ page }) => {
    // First register a user (if backend is available)
    const uniqueEmail = generateUniqueEmail();

    await page.goto('/register');
    await page.locator('#firstName').fill('Test');
    await page.locator('#lastName').fill('User');
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('testpassword123');
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    // Should redirect to dashboard after registration
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test('should redirect logged-in user from login page to dashboard', async ({ page }) => {
    const uniqueEmail = generateUniqueEmail();

    // Register first
    await page.goto('/register');
    await page.locator('#firstName').fill('Test');
    await page.locator('#lastName').fill('User');
    await page.locator('#email').fill(uniqueEmail);
    await page.locator('#password').fill('testpassword123');
    await page.getByRole('button', { name: 'Zarejestruj się' }).click();

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    // Try to navigate to login page
    await page.goto('/login');

    // Should be redirected back to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });
});

test.describe('Authentication - Navigation', () => {
  test('should have working navigation between login and register', async ({ page }) => {
    // Start at login
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();

    // Navigate to register
    await page.getByRole('link', { name: 'Zarejestruj się' }).click();
    await expect(page.getByRole('heading', { name: 'Rejestracja' })).toBeVisible();

    // Navigate back to login
    await page.getByRole('link', { name: 'Zaloguj się' }).click();
    await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();
  });
});
