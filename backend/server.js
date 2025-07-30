const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let users = [
  {
    id: 1,
    email: 'admin@test.com',
    password: 'admin123', // password: admin123
    name: 'Admin User'
  },
  {
    id: 2,
    email: 'user@test.com',
    password: 'user123', // password: admin123
    name: 'Test User'
  }
];

let tasks = [
  {
    id: 1,
    title: 'Setup Development Environment',
    description: 'Install Node.js, React, and other dependencies',
    status: 'completed',
    priority: 'high',
    userId: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Write API Documentation',
    description: 'Document all API endpoints and their usage',
    status: 'in-progress',
    priority: 'medium',
    userId: 1,
    createdAt: new Date().toISOString()
  }
];

let nextTaskId = 3;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
// POST /login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    console.log(email)
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = password === user.password;
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /items (tasks)
app.get('/items', authenticateToken, (req, res) => {
  try {
    const userTasks = tasks.filter(task => task.userId === req.user.id);
    res.json({
      message: 'Tasks retrieved successfully',
      data: userTasks
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /items (create task)
app.post('/items', authenticateToken, (req, res) => {
  try {
    const { title, description, priority = 'medium' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTask = {
      id: nextTaskId++,
      title,
      description: description || '',
      status: 'pending',
      priority,
      userId: req.user.id,
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);

    res.status(201).json({
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /items/:id (update task)
app.put('/items/:id', authenticateToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title, description, status, priority } = req.body;

    const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === req.user.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Update task fields
    if (title !== undefined) tasks[taskIndex].title = title;
    if (description !== undefined) tasks[taskIndex].description = description;
    if (status !== undefined) tasks[taskIndex].status = status;
    if (priority !== undefined) tasks[taskIndex].priority = priority;

    tasks[taskIndex].updatedAt = new Date().toISOString();

    res.json({
      message: 'Task updated successfully',
      data: tasks[taskIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /items/:id (delete task)
app.delete('/items/:id', authenticateToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId && task.userId === req.user.id);

    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.json({
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Test credentials:');
  console.log('Email: admin@test.com, Password: admin123');
  console.log('Email: user@test.com, Password: admin123');
});