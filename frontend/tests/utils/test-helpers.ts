import { Page, expect } from '@playwright/test';

export interface TaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export class TestHelpers {
  static async login(page: Page, credentials: LoginCredentials = { email: 'admin@test.com', password: 'admin123' }) {
    await page.goto('/');
    
    // Wait for login form to be visible
    await expect(page.getByTestId('email-input')).toBeVisible();
    
    await page.getByTestId('email-input').fill(credentials.email);
    await page.getByTestId('password-input').fill(credentials.password);
    await page.getByTestId('login-button').click();
    
    // Wait for successful login - look for either welcome message or add task button
    try {
      await expect(page.getByText('Welcome, Admin User!')).toBeVisible({ timeout: 10000 });
    } catch {
      // Fallback: look for the add task button which indicates successful login
      await expect(page.getByTestId('add-task-button')).toBeVisible({ timeout: 10000 });
    }
  }

  static async createTask(page: Page, taskData: TaskData): Promise<string | null> {
    // Click add task button
    await page.getByTestId('add-task-button').click();
    
    // Wait for form to be visible
    await expect(page.getByTestId('task-form')).toBeVisible();
    
    // Fill in task details
    await page.getByTestId('task-title-input').fill(taskData.title);
    
    if (taskData.description) {
      await page.getByTestId('task-description-input').fill(taskData.description);
    }
    
    if (taskData.priority) {
      await page.getByTestId('task-priority-select').selectOption(taskData.priority);
    }
    
    // Submit the form
    await page.getByTestId('submit-task-button').click();
    
    // Wait for form to disappear (indicating successful creation)
    await expect(page.getByTestId('task-form')).not.toBeVisible({ timeout: 5000 });
    
    // Get the newly created task ID
    const newTaskId = await this.getLastTaskId(page);
    
    // Verify task was created by checking the specific task element
    if (newTaskId) {
      await expect(page.getByTestId(`task-${newTaskId}`)).toBeVisible();
      // More specific verification within the task element
      await expect(page.getByTestId(`task-${newTaskId}`).getByText(taskData.title)).toBeVisible();
    }
    
    return newTaskId;
  }

  static async editTask(page: Page, taskId: string, updatedData: TaskData) {
    // Click edit button
    await page.getByTestId(`edit-task-${taskId}`).click();
    
    // Wait for edit form to be visible
    await expect(page.getByTestId('task-form')).toBeVisible();
    await expect(page.getByText('Edit Task')).toBeVisible();
    
    // Clear and fill title
    await page.getByTestId('task-title-input').clear();
    await page.getByTestId('task-title-input').fill(updatedData.title);
    
    // Handle description (might be undefined to clear it)
    if (updatedData.description !== undefined) {
      await page.getByTestId('task-description-input').clear();
      if (updatedData.description) {
        await page.getByTestId('task-description-input').fill(updatedData.description);
      }
    }
    
    // Handle priority
    if (updatedData.priority) {
      await page.getByTestId('task-priority-select').selectOption(updatedData.priority);
    }
    
    // Submit the form
    await page.getByTestId('submit-task-button').click();
    
    // Wait for form to disappear
    await expect(page.getByTestId('task-form')).not.toBeVisible({ timeout: 5000 });
    
    // Verify task was updated by checking within the specific task element
    await expect(page.getByTestId(`task-${taskId}`).getByText(updatedData.title)).toBeVisible();
  }

  static async deleteTask(page: Page, taskId: string) {
    // Set up dialog handler BEFORE clicking delete
    page.once('dialog', dialog => {
      expect(dialog.message()).toContain('Are you sure');
      dialog.accept();
    });
    
    // Click delete button
    await page.getByTestId(`delete-task-${taskId}`).click();
    
    // Wait for task to be removed
    await expect(page.getByTestId(`task-${taskId}`)).not.toBeVisible({ timeout: 5000 });
  }

  static async getTaskCount(page: Page): Promise<number> {
    // Wait for tasks section to load
    await page.waitForSelector('h2:has-text("Your Tasks")', { timeout: 5000 });
    
    // Check if "no tasks" message is visible
    const noTasksMessage = page.getByTestId('no-tasks-message');
    const isNoTasksVisible = await noTasksMessage.isVisible().catch(() => false);
    
    if (isNoTasksVisible) {
      return 0;
    }
    
    // Count actual task elements
    return await page.locator('[data-testid^="task-"]').count();
  }

  static async getLastTaskId(page: Page): Promise<string | null> {
    // Wait for tasks to load
    await page.waitForSelector('h2:has-text("Your Tasks")', { timeout: 5000 });
    
    const taskElements = page.locator('[data-testid^="task-"]');
    const count = await taskElements.count();
    
    if (count === 0) {
      return null;
    }
    
    const lastTask = taskElements.nth(count - 1);
    const testId = await lastTask.getAttribute('data-testid');
    
    return testId ? testId.replace('task-', '') : null;
  }

  static async getFirstTaskId(page: Page): Promise<string | null> {
    // Wait for tasks to load
    await page.waitForSelector('h2:has-text("Your Tasks")', { timeout: 5000 });
    
    const firstTask = page.locator('[data-testid^="task-"]').first();
    const isVisible = await firstTask.isVisible().catch(() => false);
    
    if (!isVisible) {
      return null;
    }
    
    const testId = await firstTask.getAttribute('data-testid');
    return testId ? testId.replace('task-', '') : null;
  }

  static async verifyTaskExists(page: Page, taskTitle: string, taskId?: string) {
    if (taskId) {
      // More specific verification within a specific task
      await expect(page.getByTestId(`task-${taskId}`).getByText(taskTitle)).toBeVisible();
    } else {
      // Fallback to general search but use first() to avoid strict mode violations
      await expect(page.getByText(taskTitle).first()).toBeVisible();
    }
  }

  static async verifyTaskDoesNotExist(page: Page, taskTitle: string, taskId?: string) {
    if (taskId) {
      // Check that the specific task element doesn't exist
      await expect(page.getByTestId(`task-${taskId}`)).not.toBeVisible();
    } else {
      // Check that no task with this title exists
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    }
  }

  static async changeTaskStatus(page: Page, taskId: string, status: 'pending' | 'in-progress' | 'completed') {
    const statusSelect = page.getByTestId(`status-select-${taskId}`);
    await statusSelect.selectOption(status);
    
    // Wait a moment for the change to be processed
    await page.waitForTimeout(500);
    
    // Verify the status was changed
    await expect(statusSelect).toHaveValue(status);
  }

  static async logout(page: Page) {
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Wait for redirect to login page
    await expect(page.getByTestId('email-input')).toBeVisible({ timeout: 5000 });
  }

  static async clearAllTasks(page: Page) {
    let taskCount = await this.getTaskCount(page);
    
    while (taskCount > 0) {
      // Get the first available task ID
      const firstTaskId = await this.getFirstTaskId(page);
      
      if (!firstTaskId) {
        break; // No more tasks to delete
      }
      
      // Delete the task
      await this.deleteTask(page, firstTaskId);
      
      // Get updated count
      taskCount = await this.getTaskCount(page);
    }
    
    // Verify all tasks are cleared
    await expect(page.getByTestId('no-tasks-message')).toBeVisible();
  }

  static async verifyErrorVisible(page: Page, errorMessage: string) {
    await expect(page.getByText(errorMessage)).toBeVisible();
  }

  static async verifyErrorNotVisible(page: Page, errorMessage: string) {
    await expect(page.getByText(errorMessage)).not.toBeVisible();
  }

  static async waitForLoadingToComplete(page: Page) {
    // Wait for any loading indicators to disappear
    const loadingIndicator = page.getByText('Loading...');
    const isLoadingVisible = await loadingIndicator.isVisible().catch(() => false);
    
    if (isLoadingVisible) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    }
    
    // Small additional wait for any async operations
    await page.waitForTimeout(500);
  }

  static async verifyTaskFormVisible(page: Page, isEdit: boolean = false) {
    await expect(page.getByTestId('task-form')).toBeVisible();
    const expectedText = isEdit ? 'Edit Task' : 'Add New Task';
    await expect(page.getByText(expectedText)).toBeVisible();
  }

  static async verifyTaskFormHidden(page: Page) {
    await expect(page.getByTestId('task-form')).not.toBeVisible();
  }

  static async cancelTaskForm(page: Page) {
    const cancelButton = page.getByTestId('cancel-edit-button');
    const isCancelVisible = await cancelButton.isVisible().catch(() => false);
    
    if (isCancelVisible) {
      await cancelButton.click();
    } else {
      // If no cancel button, click the add task button to toggle form off
      await page.getByTestId('add-task-button').click();
    }
    
    await this.verifyTaskFormHidden(page);
  }

  static async verifyPriorityDisplay(page: Page, taskId: string, priority: string) {
    // Verify priority within the specific task element
    const taskElement = page.getByTestId(`task-${taskId}`);
    const priorityElement = taskElement.locator(`.priority-badge.${priority}`);
    await expect(priorityElement).toBeVisible();
  }

  static async getTaskIdByTitle(page: Page, title: string): Promise<string | null> {
    // Wait for tasks to load
    await page.waitForSelector('h2:has-text("Your Tasks")', { timeout: 5000 });
    
    // Find the task element that contains the title
    const taskElement = page.locator(`[data-testid^="task-"]:has-text("${title}")`).first();
    const isVisible = await taskElement.isVisible().catch(() => false);
    
    if (!isVisible) {
      return null;
    }
    
    const testId = await taskElement.getAttribute('data-testid');
    return testId ? testId.replace('task-', '') : null;
  }

  static async verifyTaskCreationDate(page: Page, taskId: string) {
    // Get the date format used by the app (check your App.js for the exact format)
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    // Verify creation date within the specific task element
    const taskElement = page.getByTestId(`task-${taskId}`);
    await expect(taskElement.getByText(`Created: ${formattedDate}`)).toBeVisible();
  }

  // New method to generate unique task titles to avoid conflicts
  static generateUniqueTaskTitle(baseTitle: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${baseTitle}_${timestamp}_${random}`;
  }

  // Enhanced method to verify task creation with unique verification
  static async createTaskAndVerify(page: Page, taskData: TaskData): Promise<string> {
    const uniqueTitle = this.generateUniqueTaskTitle(taskData.title);
    const uniqueTaskData = { ...taskData, title: uniqueTitle };
    
    const taskId = await this.createTask(page, uniqueTaskData);
    if (!taskId) {
      throw new Error('Failed to create task');
    }
    
    // Verify the task exists with the unique title
    await this.verifyTaskExists(page, uniqueTitle, taskId);
    
    if (taskData.priority) {
      await this.verifyPriorityDisplay(page, taskId, taskData.priority);
    }
    
    return taskId;
  }

  // Method to clear form if it's visible
  static async ensureFormClosed(page: Page) {
    const isFormVisible = await page.getByTestId('task-form').isVisible().catch(() => false);
    
    if (isFormVisible) {
      // Try cancel button first
      const cancelButton = page.getByTestId('cancel-edit-button');
      const isCancelVisible = await cancelButton.isVisible().catch(() => false);
      
      if (isCancelVisible) {
        await cancelButton.click();
      } else {
        // Click add task button to toggle form off
        await page.getByTestId('add-task-button').click();
      }
      
      await this.verifyTaskFormHidden(page);
    }
  }
}