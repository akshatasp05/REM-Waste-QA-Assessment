import React, { useState, useEffect } from 'react';
import './app.css';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.data);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setLoginData({ email: '', password: '' });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setTasks([]);
    localStorage.removeItem('token');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setError('Title is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskForm)
      });

      const data = await response.json();

      if (response.ok) {
        setTasks([...tasks, data.data]);
        setTaskForm({ title: '', description: '', priority: 'medium' });
        setShowAddForm(false);
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setError('Title is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/items/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskForm)
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === editingTask.id ? data.data : task
        ));
        setTaskForm({ title: '', description: '', priority: 'medium' });
        setEditingTask(null);
      } else {
        setError(data.error || 'Failed to update task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/items/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete task');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const response = await fetch(`${API_BASE_URL}/items/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...task, status: newStatus })
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(tasks.map(t => 
          t.id === taskId ? data.data : t
        ));
      } else {
        setError(data.error || 'Failed to update task status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', priority: 'medium' });
  };

  if (!token) {
    return (
      <div className="app">
        <div className="login-container">
          <h1>Task Manager</h1>
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                data-testid="email-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                data-testid="password-input"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              data-testid="login-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="test-credentials">
              <p><strong>Test Credentials:</strong></p>
              <p>Email: admin@test.com</p>
              <p>Password: admin123</p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Task Manager</h1>
        <div className="user-info">
          <span>Welcome, {user?.name || 'User'}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <main className="main-content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="task-actions">
          <button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingTask(null);
              setTaskForm({ title: '', description: '', priority: 'medium' });
            }}
            className="add-task-btn"
            data-testid="add-task-button"
          >
            {showAddForm ? 'Cancel' : 'Add New Task'}
          </button>
        </div>

        {(showAddForm || editingTask) && (
          <form 
            onSubmit={editingTask ? handleUpdateTask : handleAddTask} 
            className="task-form"
            data-testid="task-form"
          >
            <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                required
                data-testid="task-title-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                rows="3"
                data-testid="task-description-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority:</label>
              <select
                id="priority"
                name="priority"
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                data-testid="task-priority-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} data-testid="submit-task-button">
                {loading ? 'Saving...' : (editingTask ? 'Update Task' : 'Add Task')}
              </button>
              {editingTask && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="cancel-btn"
                  data-testid="cancel-edit-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="tasks-container">
          <h2>Your Tasks ({tasks.length})</h2>
          {loading && <div className="loading">Loading...</div>}
          {tasks.length === 0 ? (
            <div className="no-tasks" data-testid="no-tasks-message">
              No tasks yet. Add your first task!
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map(task => (
                <div key={task.id} className={`task-card ${task.status}`} data-testid={`task-${task.id}`}>
                  <div className="task-header">
                    <h3>{task.title}</h3>
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-status">
                    <label>Status: </label>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      data-testid={`status-select-${task.id}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="task-actions">
                    <button 
                      onClick={() => startEdit(task)}
                      className="edit-btn"
                      data-testid={`edit-task-${task.id}`}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="delete-btn"
                      data-testid={`delete-task-${task.id}`}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="task-meta">
                    <small>Created: {new Date(task.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;