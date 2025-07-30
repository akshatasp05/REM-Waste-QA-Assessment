// data-driven.spec.ts
import { test, expect } from '@playwright/test';
import { TestHelpers, TaskData } from './utils/test-helpers';

test.describe('Data-Driven Tests', () => {
  test.beforeEach(async ({ page }) => {
    await TestHelpers.login(page);
    await TestHelpers.ensureFormClosed(page);
  });

  test.afterEach(async ({ page }) => {
    await TestHelpers.ensureFormClosed(page);
  });

  const baseTestTasks: TaskData[] = [
    { title: 'High Priority Task', description: 'This is a high priority task', priority: 'high' },
    { title: 'Medium Priority Task', description: 'This is a medium priority task', priority: 'medium' },
    { title: 'Low Priority Task', description: 'This is a low priority task', priority: 'low' },
    { title: 'Task without description', priority: 'medium' },
    { title: 'Task with special characters', description: 'Testing special characters !@#$%', priority: 'high' },
    { title: 'Very long task title for testing', description: 'Testing long titles', priority: 'low' }
  ];

  test('should create multiple tasks with different priorities', async ({ page }) => {
    const initialTaskCount = await TestHelpers.getTaskCount(page);
    const createdTaskIds: string[] = [];
    
    // Create all test tasks with unique titles
    for (const task of baseTestTasks) {
      const taskId = await TestHelpers.createTaskAndVerify(page, task);
      createdTaskIds.push(taskId);
    }
    
    // Verify all tasks were created
    const finalTaskCount = await TestHelpers.getTaskCount(page);
    expect(finalTaskCount).toBe(initialTaskCount + baseTestTasks.length);
    
    // Verify each task exists with correct priority
    for (let i = 0; i < createdTaskIds.length; i++) {
      const taskId = createdTaskIds[i];
      const task = baseTestTasks[i];
      
      if (task.priority) {
        await TestHelpers.verifyPriorityDisplay(page, taskId, task.priority);
      }
    }
  });

  test('should edit tasks with different data sets', async ({ page }) => {
    // Create a task first
    const taskId = await TestHelpers.createTaskAndVerify(page, { 
      title: 'Original Task', 
      description: 'Original description', 
      priority: 'medium' 
    });
    
    const updatedTasks: TaskData[] = [
      { title: 'Updated Task 1', description: 'Updated description 1', priority: 'high' },
      { title: 'Updated Task 2', description: 'Updated description 2', priority: 'low' },
      { title: 'Updated Task 3', priority: 'medium' }, // No description
      { title: 'Updated Task with Special Chars', description: 'Special chars in description too!', priority: 'high' }
    ];
    
    // Edit the task multiple times with different data
    for (const updatedTask of updatedTasks) {
      const uniqueUpdatedTask = {
        ...updatedTask,
        title: TestHelpers.generateUniqueTaskTitle(updatedTask.title)
      };
      
      await TestHelpers.editTask(page, taskId, uniqueUpdatedTask);
      
      // Verify the task was updated correctly within the specific task element
      const taskElement = page.getByTestId(`task-${taskId}`);
      await expect(taskElement.getByText(uniqueUpdatedTask.title)).toBeVisible();
      
      if (uniqueUpdatedTask.description) {
        await expect(taskElement.getByText(uniqueUpdatedTask.description)).toBeVisible();
      }
      if (uniqueUpdatedTask.priority) {
        await TestHelpers.verifyPriorityDisplay(page, taskId, uniqueUpdatedTask.priority);
      }
    }
  });

  test('should handle tasks with edge case data', async ({ page }) => {
    const edgeCaseTasks: TaskData[] = [
      { title: 'Task with spaces', description: 'Description with spaces', priority: 'low' },
      { title: 'Single char', description: 'Single char title', priority: 'high' }, // Very short title
      { title: 'Task with quotes', description: 'Testing quotes in content', priority: 'medium' },
      { title: 'Task with newlines', description: 'Description with line breaks', priority: 'high' },
      { title: 'Numeric title 12345', description: 'Numeric title', priority: 'low' } // Numeric title
    ];

    const initialTaskCount = await TestHelpers.getTaskCount(page);
    const createdTaskIds: string[] = [];

    for (const task of edgeCaseTasks) {
      const taskId = await TestHelpers.createTaskAndVerify(page, task);
      createdTaskIds.push(taskId);
    }

    const finalTaskCount = await TestHelpers.getTaskCount(page);
    expect(finalTaskCount).toBe(initialTaskCount + edgeCaseTasks.length);
  });

  test('should create and delete tasks in sequence', async ({ page }) => {
    const tasksToCreate = baseTestTasks.slice(0, 3); // Use first 3 tasks
    const createdTaskIds: string[] = [];
    
    // Create tasks and store their IDs
    for (const task of tasksToCreate) {
      const taskId = await TestHelpers.createTaskAndVerify(page, task);
      createdTaskIds.push(taskId);
    }
    
    // Delete tasks in reverse order using stored IDs
    for (let i = createdTaskIds.length - 1; i >= 0; i--) {
      const taskId = createdTaskIds[i];
      
      await TestHelpers.deleteTask(page, taskId);
      
      // Verify the specific task was deleted
      await expect(page.getByTestId(`task-${taskId}`)).not.toBeVisible();
    }
  });

  test('should test all status transitions for multiple tasks', async ({ page }) => {
    const statusTestTasks = baseTestTasks.slice(0, 2); // Use first 2 tasks
    const taskIds: string[] = [];
    
    // Create test tasks
    for (const task of statusTestTasks) {
      const taskId = await TestHelpers.createTaskAndVerify(page, task);
      taskIds.push(taskId);
    }
    
    const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
    
    // Test all status transitions for each task
    for (const taskId of taskIds) {
      for (const status of statuses) {
        await TestHelpers.changeTaskStatus(page, taskId, status);
      }
    }
  });

  test('should handle rapid task creation', async ({ page }) => {
    const rapidTasks: TaskData[] = Array.from({ length: 5 }, (_, i) => ({
      title: `Rapid Task ${i + 1}`,
      description: `Description for rapid task ${i + 1}`,
      priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high'
    }));

    const initialTaskCount = await TestHelpers.getTaskCount(page);
    const createdTaskIds: string[] = [];

    // Create tasks rapidly
    for (const task of rapidTasks) {
      const taskId = await TestHelpers.createTaskAndVerify(page, task);
      createdTaskIds.push(taskId);
    }

    // Verify all tasks were created
    const finalTaskCount = await TestHelpers.getTaskCount(page);
    expect(finalTaskCount).toBe(initialTaskCount + rapidTasks.length);

    // Verify each task exists
    for (let i = 0; i < createdTaskIds.length; i++) {
      const taskId = createdTaskIds[i];
      const taskElement = page.getByTestId(`task-${taskId}`);
      await expect(taskElement).toBeVisible();
    }
  });

  test('should validate priority display for all priority levels', async ({ page }) => {
    const priorityTasks: TaskData[] = [
      { title: 'Low Priority Test', priority: 'low' },
      { title: 'Medium Priority Test', priority: 'medium' },
      { title: 'High Priority Test', priority: 'high' }
    ];

    const createdTaskIds: string[] = [];

    for (const task of priorityTasks) {
      const taskId = await TestHelpers.createTaskAndVerify(page, task);
      createdTaskIds.push(taskId);
      
      // Verify priority is displayed correctly for this specific task
      await TestHelpers.verifyPriorityDisplay(page, taskId, task.priority!);
    }
  });
});