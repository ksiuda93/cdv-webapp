import { test, expect } from '@playwright/test';

test.describe('Users Page - Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should display users page correctly', async ({ page }) => {
    // Check page header
    await expect(page.getByRole('heading', { name: 'Zarządzanie klientami' })).toBeVisible();
    await expect(page.getByText('Lista wszystkich klientów banku')).toBeVisible();

    // Check add user button
    await expect(page.getByRole('button', { name: '+ Dodaj klienta' })).toBeVisible();
  });

  test('should display users table with headers', async ({ page }) => {
    // Check table exists
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Imię' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Nazwisko' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'E-mail' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Stan konta' })).toBeVisible();
  });

  test('should display initial mock users', async ({ page }) => {
    // Check that some users are displayed (mock data)
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(5); // 5 initial mock users

    // Check first user data is visible
    await expect(page.getByRole('cell', { name: 'Jan' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Kowalski' })).toBeVisible();
  });

  test('should display edit and delete buttons for each user', async ({ page }) => {
    // Check action buttons exist for first user
    const editButtons = page.getByRole('button', { name: /Edytuj/ });
    const deleteButtons = page.getByRole('button', { name: /Usuń/ });

    await expect(editButtons.first()).toBeVisible();
    await expect(deleteButtons.first()).toBeVisible();
  });

  test('should display balance with proper formatting', async ({ page }) => {
    // Check that balance badges are displayed
    const badges = page.locator('.badge');
    await expect(badges.first()).toBeVisible();

    // Should contain PLN currency formatting
    await expect(page.getByText(/zł/)).toBeVisible();
  });
});

test.describe('Users Page - Add User Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should open add user modal when clicking add button', async ({ page }) => {
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();

    // Check modal is visible
    const modal = page.locator('dialog[open]');
    await expect(modal).toBeVisible();

    // Check modal title
    await expect(page.getByRole('heading', { name: 'Dodaj nowego klienta' })).toBeVisible();
  });

  test('should display all form fields in add modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();

    // Check all form fields
    await expect(page.locator('#firstName')).toBeVisible();
    await expect(page.locator('#lastName')).toBeVisible();
    await expect(page.locator('#userEmail')).toBeVisible();
    await expect(page.locator('#userPassword')).toBeVisible();
    await expect(page.locator('#balance')).toBeVisible();

    // Check buttons
    await expect(page.getByRole('button', { name: 'Anuluj' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dodaj klienta' })).toBeVisible();
  });

  test('should close modal when clicking cancel', async ({ page }) => {
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();

    // Wait for modal to be visible
    await expect(page.locator('dialog[open]')).toBeVisible();

    // Click cancel
    await page.getByRole('button', { name: 'Anuluj' }).click();

    // Modal should be closed
    await expect(page.locator('dialog[open]')).not.toBeVisible();
  });

  test('should close modal when clicking X button', async ({ page }) => {
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();
    await expect(page.locator('dialog[open]')).toBeVisible();

    // Click close button
    await page.getByRole('button', { name: 'Zamknij modal' }).click();

    await expect(page.locator('dialog[open]')).not.toBeVisible();
  });

  test('should close modal when pressing Escape', async ({ page }) => {
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();
    await expect(page.locator('dialog[open]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    await expect(page.locator('dialog[open]')).not.toBeVisible();
  });

  test('should add new user successfully', async ({ page }) => {
    // Count initial users
    const initialRowCount = await page.locator('tbody tr').count();

    // Open modal
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();

    // Fill form
    await page.locator('#firstName').fill('Nowy');
    await page.locator('#lastName').fill('Klient');
    await page.locator('#userEmail').fill('nowy.klient@example.com');
    await page.locator('#userPassword').fill('password123');
    await page.locator('#balance').fill('5000');

    // Submit
    await page.getByRole('button', { name: 'Dodaj klienta' }).click();

    // Modal should close
    await expect(page.locator('dialog[open]')).not.toBeVisible();

    // New user should be in the table
    await expect(page.getByRole('cell', { name: 'Nowy' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'nowy.klient@example.com' })).toBeVisible();

    // User count should increase
    const newRowCount = await page.locator('tbody tr').count();
    expect(newRowCount).toBe(initialRowCount + 1);
  });

  test('should focus first input when modal opens', async ({ page }) => {
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();

    // First input should be focused
    await expect(page.locator('#firstName')).toBeFocused();
  });
});

test.describe('Users Page - Edit User Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should open edit modal with user data', async ({ page }) => {
    // Click edit on first user (Jan Kowalski)
    await page.getByRole('button', { name: 'Edytuj Jan Kowalski' }).click();

    // Check modal is visible with edit title
    await expect(page.getByRole('heading', { name: 'Edytuj klienta' })).toBeVisible();

    // Check form is pre-filled
    await expect(page.locator('#firstName')).toHaveValue('Jan');
    await expect(page.locator('#lastName')).toHaveValue('Kowalski');
    await expect(page.locator('#userEmail')).toHaveValue('jan.kowalski@example.com');
  });

  test('should show optional password field when editing', async ({ page }) => {
    await page.getByRole('button', { name: 'Edytuj Jan Kowalski' }).click();

    // Password should be optional (empty and not required)
    const passwordLabel = page.locator('label[for="userPassword"]');
    await expect(passwordLabel).toContainText('opcjonalne');
  });

  test('should update user successfully', async ({ page }) => {
    // Click edit on first user
    await page.getByRole('button', { name: 'Edytuj Jan Kowalski' }).click();

    // Change first name
    await page.locator('#firstName').clear();
    await page.locator('#firstName').fill('Janusz');

    // Submit
    await page.getByRole('button', { name: 'Zapisz zmiany' }).click();

    // Modal should close
    await expect(page.locator('dialog[open]')).not.toBeVisible();

    // Updated name should be visible
    await expect(page.getByRole('cell', { name: 'Janusz' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Jan' })).not.toBeVisible();
  });
});

test.describe('Users Page - Delete User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should show confirmation dialog when deleting', async ({ page }) => {
    // Setup dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Czy na pewno chcesz usunąć');
      await dialog.dismiss(); // Cancel deletion
    });

    // Click delete on first user
    await page.getByRole('button', { name: 'Usuń Jan Kowalski' }).click();
  });

  test('should delete user when confirmed', async ({ page }) => {
    // Count initial users
    const initialRowCount = await page.locator('tbody tr').count();

    // Setup dialog handler to accept
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Click delete on first user
    await page.getByRole('button', { name: 'Usuń Jan Kowalski' }).click();

    // User count should decrease
    const newRowCount = await page.locator('tbody tr').count();
    expect(newRowCount).toBe(initialRowCount - 1);

    // User should no longer be in table
    await expect(page.getByRole('cell', { name: 'jan.kowalski@example.com' })).not.toBeVisible();
  });

  test('should not delete user when cancelled', async ({ page }) => {
    // Count initial users
    const initialRowCount = await page.locator('tbody tr').count();

    // Setup dialog handler to dismiss
    page.on('dialog', async dialog => {
      await dialog.dismiss();
    });

    // Click delete on first user
    await page.getByRole('button', { name: 'Usuń Jan Kowalski' }).click();

    // User count should remain the same
    const newRowCount = await page.locator('tbody tr').count();
    expect(newRowCount).toBe(initialRowCount);

    // User should still be in table
    await expect(page.getByRole('cell', { name: 'jan.kowalski@example.com' })).toBeVisible();
  });
});

test.describe('Users Page - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should have navbar with links', async ({ page }) => {
    // Check navbar exists
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Check links
    await expect(page.getByRole('link', { name: 'Bank CDV' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Użytkownicy/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Logowanie' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Rejestracja' })).toBeVisible();
  });

  test('should mark current page in navigation', async ({ page }) => {
    const usersLink = page.getByRole('link', { name: /Użytkownicy/ });
    await expect(usersLink).toHaveAttribute('aria-current', 'page');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Logowanie' }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Rejestracja' }).click();
    await expect(page).toHaveURL(/.*\/register/);
  });
});

test.describe('Users Page - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
  });

  test('should have skip link', async ({ page }) => {
    const skipLink = page.locator('a', { hasText: 'Przejdź do głównej treści' });
    await expect(skipLink).toBeAttached();
  });

  test('should have proper table accessibility', async ({ page }) => {
    // Table should have caption
    const caption = page.locator('caption');
    await expect(caption).toBeAttached();

    // Table headers should have scope
    const headers = page.locator('th[scope="col"]');
    expect(await headers.count()).toBeGreaterThan(0);
  });

  test('should have aria-labels on action buttons', async ({ page }) => {
    // Edit buttons should have descriptive aria-labels
    const editButton = page.getByRole('button', { name: /Edytuj .+ .+/ });
    await expect(editButton.first()).toBeVisible();

    // Delete buttons should have descriptive aria-labels
    const deleteButton = page.getByRole('button', { name: /Usuń .+ .+/ });
    await expect(deleteButton.first()).toBeVisible();
  });

  test('should have accessible modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ Dodaj klienta' }).click();

    // Modal should have aria-modal
    const modal = page.locator('dialog[aria-modal="true"]');
    await expect(modal).toBeVisible();

    // Modal should have aria-labelledby
    await expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  test('should have proper navigation landmark', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Nawigacja główna"]');
    await expect(nav).toBeVisible();
  });

  test('should have main content landmark', async ({ page }) => {
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });
});
