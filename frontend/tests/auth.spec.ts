import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
  
    await page.goto('/');
  });

  test('should display login form by default', async ({ page }) => {
    
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    
   
    await expect(page.getByRole('heading', { name: 'Task Manager' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill in valid credentials
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('admin123');
    
    // Click login button
    await page.getByTestId('login-button').click();
    
    // Verify successful login - should redirect to dashboard
    await expect(page.getByRole('heading', { name: 'Task Manager' })).toBeVisible();
    await expect(page.getByText('Welcome, Admin User!')).toBeVisible();
    
    // Verify login form is no longer visible
    await expect(page.getByTestId('email-input')).not.toBeVisible();
    await expect(page.getByTestId('password-input')).not.toBeVisible();
    
    // Verify dashboard elements are visible
    await expect(page.getByTestId('add-task-button')).toBeVisible();
    await expect(page.getByText('Your Tasks')).toBeVisible();
  });

  test('should show error message with invalid email', async ({ page }) => {
    // Fill in invalid email
    await page.getByTestId('email-input').fill('invalid@test.com');
    await page.getByTestId('password-input').fill('admin123');
    
    // Click login button
    await page.getByTestId('login-button').click();
    
    // Verify error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    
    // Verify still on login page
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
  });

  test('should show error message with invalid password', async ({ page }) => {
    // Fill in valid email but invalid password
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    
    // Click login button
    await page.getByTestId('login-button').click();
    
    // Verify error message
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    
    // Verify still on login page
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
  });

  test('should show error message with empty credentials', async ({ page }) => {
    // Try to login with empty fields
    await page.getByTestId('login-button').click();
    
    // Verify form validation (browser should prevent submission)
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
  });


}); 