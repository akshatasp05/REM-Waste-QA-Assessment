# Playwright UI Automation Tests

This directory contains comprehensive UI automation tests for the Task Manager application using Playwright with TypeScript.

## Test Structure

### Test Files

1. **`auth.spec.ts`** - Authentication tests
   - Login with valid/invalid credentials
   - Error handling for invalid inputs
   - Logout functionality
   - Session persistence
   - Network error handling

2. **`task-management.spec.ts`** - Task management tests
   - Creating new tasks
   - Editing existing tasks
   - Deleting tasks
   - Task status changes
   - Form validation
   - Loading states

3. **`integration.spec.ts`** - End-to-end workflow tests
   - Complete user workflows
   - Data persistence
   - Concurrent operations
   - Error scenarios

4. **`data-driven.spec.ts`** - Data-driven tests
   - Multiple data sets
   - Edge cases
   - Different user credentials
   - Various data types

5. **`utils/test-helpers.ts`** - Reusable test utilities
   - Common test operations
   - Helper functions
   - Type definitions

## Prerequisites

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Install Playwright Browsers:**
   ```bash
   npx playwright install
   ```

3. **Start the Backend Server:**
   ```bash
   cd ../backend
   npm install
   npm start
   ```

4. **Start the Frontend Development Server:**
   ```bash
   cd ../frontend
   npm run dev
   ```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug
```

### Running Specific Test Files

```bash
# Run only authentication tests
npx playwright test auth.spec.ts

# Run only task management tests
npx playwright test task-management.spec.ts

# Run only integration tests
npx playwright test integration.spec.ts

# Run only data-driven tests
npx playwright test data-driven.spec.ts
```

### Running Tests on Specific Browsers

```bash
# Run tests only on Chrome
npx playwright test --project=chromium

# Run tests only on Firefox
npx playwright test --project=firefox

# Run tests only on Safari
npx playwright test --project=webkit

# Run tests on mobile browsers
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Running Tests in Parallel

```bash
# Run tests in parallel (default)
npx playwright test

# Run tests sequentially
npx playwright test --workers=1
```

## Test Scenarios Covered

### Authentication Tests
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Error message display
- ✅ Loading states during login
- ✅ Logout functionality
- ✅ Session persistence
- ✅ Network error handling

### Task Management Tests
- ✅ Creating new tasks
- ✅ Editing existing tasks
- ✅ Deleting tasks
- ✅ Task status changes
- ✅ Form validation
- ✅ Loading states
- ✅ Priority selection
- ✅ Error handling

### Integration Tests
- ✅ Complete user workflows
- ✅ Data persistence across page refresh
- ✅ Concurrent operations
- ✅ Error scenario handling
- ✅ State management verification

### Data-Driven Tests
- ✅ Multiple data sets
- ✅ Edge cases (empty fields, special characters)
- ✅ Different user credentials
- ✅ Various data types (unicode, emojis, HTML)
- ✅ Priority combinations
- ✅ Status transitions

## Test Data

### Test Credentials
- **Admin User:** `admin@test.com` / `admin123`
- **Test User:** `user@test.com` / `user123`

### Sample Tasks
The backend includes sample tasks that are used in tests:
- "Setup Development Environment" (completed, high priority)
- "Write API Documentation" (in-progress, medium priority)

## Test Utilities

The `TestHelpers` class provides reusable functions:

```typescript
// Login helper
await TestHelpers.login(page, { email: 'admin@test.com', password: 'admin123' });

// Create task helper
await TestHelpers.createTask(page, { 
  title: 'Test Task', 
  description: 'Test description', 
  priority: 'high' 
});

// Edit task helper
await TestHelpers.editTask(page, taskId, { 
  title: 'Updated Task', 
  description: 'Updated description' 
});

// Delete task helper
await TestHelpers.deleteTask(page, taskId);

// Verify task exists
await TestHelpers.verifyTaskExists(page, 'Task Title');

// Get task count
const count = await TestHelpers.getTaskCount(page);
```

## Configuration

The tests are configured in `playwright.config.ts`:

- **Base URL:** `http://localhost:5173` (Vite dev server)
- **Web Server:** Automatically starts `npm run dev`
- **Browsers:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Screenshots:** On failure
- **Videos:** On failure
- **Traces:** On first retry

## Debugging Tests

### Debug Mode
```bash
npm run test:e2e:debug
```

### UI Mode
```bash
npm run test:e2e:ui
```

### Manual Debugging
```typescript
// Add debugger statement in test
debugger;

// Use page.pause() to pause execution
await page.pause();

// Use page.screenshot() to take screenshots
await page.screenshot({ path: 'debug-screenshot.png' });
```

## Best Practices

1. **Use Test IDs:** All elements have `data-testid` attributes for reliable selection
2. **Wait for Elements:** Use `expect().toBeVisible()` to wait for elements
3. **Handle Dialogs:** Use `page.on('dialog', dialog => dialog.accept())` for confirmations
4. **Clean State:** Tests are independent and don't rely on previous test state
5. **Error Handling:** Tests verify both success and error scenarios
6. **Data Validation:** Tests assert presence of expected data after actions

## Troubleshooting

### Common Issues

1. **Tests fail with "Element not found"**
   - Ensure both frontend and backend servers are running
   - Check that the application loads correctly in browser

2. **Tests fail with "Timeout"**
   - Increase timeout in `playwright.config.ts`
   - Check for slow network or server issues

3. **Tests fail on specific browsers**
   - Run tests on different browsers to isolate issues
   - Check browser-specific selectors

4. **Flaky tests**
   - Add explicit waits for elements
   - Use `page.waitForLoadState()` for page loads
   - Check for race conditions

### Debug Commands

```bash
# Show test results in browser
npx playwright show-report

# Show traces
npx playwright show-trace trace.zip

# Generate test report
npx playwright test --reporter=html
```

## Continuous Integration

For CI/CD pipelines, use:

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run tests
npx playwright test --reporter=html
```

The tests are designed to be reliable and repeatable in CI environments. 