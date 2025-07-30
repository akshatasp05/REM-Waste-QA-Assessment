// task-management.spec.ts
import { test, expect } from '@playwright/test';
import { TestHelpers } from './utils/test-helpers';

test.describe('Task Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await TestHelpers.login(page);
    // Ensure any form is closed before starting each test
    await TestHelpers.ensureFormClosed(page);
  });

  test.afterEach(async ({ page }) => {
    // Clean up any forms or dialogs after each test
    await TestHelpers.ensureFormClosed(page);
  });

  test('should display existing tasks on dashboard', async ({ page }) => {
    // Verify tasks section is loaded
    await expect(page.getByText('Your Tasks')).toBeVisible();
    
    // Wait for tasks to load and check if any exist
    const taskCount = await TestHelpers.getTaskCount(page);
    
    if (taskCount > 0) {
      // Verify at least one task is visible
      const firstTaskId = await TestHelpers.getFirstTaskId(page);
      if (firstTaskId) {
        await expect(page.getByTestId(`task-${firstTaskId}`)).toBeVisible();
      }
    } else {
      // Verify no tasks message is shown
      await expect(page.getByTestId('no-tasks-message')).toBeVisible();
    }
  });

  test('should create a new task successfully', async ({ page }) => {
    const initialTaskCount = await TestHelpers.getTaskCount(page);
    
    // Create a task with unique title
    const taskId = await TestHelpers.createTaskAndVerify(page, {
      title: 'Test Task Title',
      description: 'Test task description',
      priority: 'high'
    });
    
    // Verify task details within the specific task element
    const taskElement = page.getByTestId(`task-${taskId}`);
    await expect(taskElement.getByText('Test task description')).toBeVisible();
    await expect(taskElement.locator('.priority-badge.high')).toBeVisible();
    
    // Verify task count increased
    const finalTaskCount = await TestHelpers.getTaskCount(page);
    expect(finalTaskCount).toBe(initialTaskCount + 1);
  });

  test('should show error when creating task without title', async ({ page }) => {
    // Click add task button
    await page.getByTestId('add-task-button').click();
    
    // Fill in description but leave title empty
    await page.getByTestId('task-description-input').fill('Test description');
    await page.getByTestId('task-priority-select').selectOption('medium');
    
    // Try to submit
    await page.getByTestId('submit-task-button').click();
    
    // Look for error message in the error container or anywhere on page
    const errorMessages = [
      'Title is required',
      'Please fill out this field',
      'This field is required'
    ];
    
    let errorFound = false;
    for (const errorMsg of errorMessages) {
      try {
        await expect(page.getByText(errorMsg)).toBeVisible({ timeout: 2000 });
        errorFound = true;
        break;
      } catch {
        // Continue to next error message
      }
    }
    
    // If no specific error message found, check that form is still visible (indicating validation failed)
    if (!errorFound) {
      await expect(page.getByTestId('task-form')).toBeVisible();
      // Also check if browser's built-in validation prevents submission
      const titleInput = page.getByTestId('task-title-input');
      const isRequired = await titleInput.getAttribute('required');
      expect(isRequired).not.toBeNull();
    }
  });

  test('should edit an existing task successfully', async ({ page }) => {
    // First, create a task to edit
    const taskId = await TestHelpers.createTaskAndVerify(page, {
      title: 'Task to Edit',
      description: 'Original description',
      priority: 'medium'
    });
    
    // Edit the task
    await TestHelpers.editTask(page, taskId, {
      title: 'Updated Task Title',
      description: 'Updated description',
      priority: 'high'
    });
    
    // Verify task was updated within the specific task element
    const taskElement = page.getByTestId(`task-${taskId}`);
    await expect(taskElement.getByText('Updated Task Title')).toBeVisible();
    await expect(taskElement.getByText('Updated description')).toBeVisible();
    await expect(taskElement.locator('.priority-badge.high')).toBeVisible();
    
    // Verify old title is no longer visible in this specific task
    await expect(taskElement.getByText('Task to Edit')).not.toBeVisible();
  });

  test('should cancel edit operation', async ({ page }) => {
    // First, create a task
    const taskId = await TestHelpers.createTaskAndVerify(page, {
      title: 'Task to Cancel Edit',
      description: 'Original description',
      priority: 'medium'
    });
    
    // Start editing
    await page.getByTestId(`edit-task-${taskId}`).click();
    
    // Verify edit form is visible
    await expect(page.getByTestId('task-form')).toBeVisible();
    await expect(page.getByText('Edit Task')).toBeVisible();
    
    // Make some changes
    await page.getByTestId('task-title-input').clear();
    await page.getByTestId('task-title-input').fill('Changed Title');
    
    // Cancel the edit
    await page.getByTestId('cancel-edit-button').click();
    
    // Verify form is hidden
    await expect(page.getByTestId('task-form')).not.toBeVisible();
    
    // Verify original task is still there unchanged
    const taskElement = page.getByTestId(`task-${taskId}`);
    await expect(taskElement.getByText('Task to Cancel Edit')).toBeVisible();
    await expect(taskElement.getByText('Changed Title')).not.toBeVisible();
  });

  test('should delete a task successfully', async ({ page }) => {
    // First, create a task to delete
    const taskId = await TestHelpers.createTaskAndVerify(page, {
      title: 'Task to Delete',
      description: 'This task will be deleted',
      priority: 'low'
    });
    
    const initialTaskCount = await TestHelpers.getTaskCount(page);
    
    // Delete the task
    await TestHelpers.deleteTask(page, taskId);
    
    // Verify task was deleted
    await expect(page.getByTestId(`task-${taskId}`)).not.toBeVisible();
    
    // Verify task count decreased
    const finalTaskCount = await TestHelpers.getTaskCount(page);
    expect(finalTaskCount).toBe(initialTaskCount - 1);
  });

  test('should change task status', async ({ page }) => {
    // First, create a task
    const taskId = await TestHelpers.createTaskAndVerify(page, {
      title: 'Status Change Task',
      description: 'Testing status changes',
      priority: 'medium'
    });
    
    // Change status to 'in-progress'
    await TestHelpers.changeTaskStatus(page, taskId, 'in-progress');
    
    // Change status to 'completed'
    await TestHelpers.changeTaskStatus(page, taskId, 'completed');
    
    // Change back to 'pending'
    await TestHelpers.changeTaskStatus(page, taskId, 'pending');
  });

  test('should handle add form toggle correctly', async ({ page }) => {
    // Verify add button shows form
    await page.getByTestId('add-task-button').click();
    await expect(page.getByTestId('task-form')).toBeVisible();
    await expect(page.getByText('Add New Task')).toBeVisible();
    
    // Verify clicking again hides form
    await page.getByTestId('add-task-button').click();
    await expect(page.getByTestId('task-form')).not.toBeVisible();
  });

  test('should display task creation date', async ({ page }) => {
    // Create a task
    const taskId = await TestHelpers.createTaskAndVerify(page, {
      title: 'Date Test Task',
      description: 'Testing date display',
      priority: 'medium'
    });
    
    // Verify creation date is displayed within the specific task
    await TestHelpers.verifyTaskCreationDate(page, taskId);
  });
});