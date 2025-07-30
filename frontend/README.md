# Task Manager Frontend

A modern React-based task management application with a beautiful UI and full CRUD functionality, built with Vite for lightning-fast development.

## Features

- 🔐 User authentication with JWT tokens
- 📝 Create, read, update, and delete tasks
- 🎯 Task priority levels (Low, Medium, High)
- 📊 Task status tracking (Pending, In Progress, Completed)
- 🎨 Modern, responsive design
- 📱 Mobile-friendly interface
- 🔄 Real-time updates
- ⚡ Lightning-fast development with Vite

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

```bash
npm run dev
```
This will start the Vite development server on `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Login
- Use the test credentials provided on the login page:
  - Email: `admin@test.com`
  - Password: `admin123`

### Managing Tasks
1. **Add Task**: Click "Add New Task" and fill in the form
2. **Edit Task**: Click the "Edit" button on any task card
3. **Delete Task**: Click the "Delete" button (with confirmation)
4. **Change Status**: Use the status dropdown on each task card
5. **Set Priority**: Choose priority when creating or editing tasks

### Task Properties
- **Title**: Required field for task name
- **Description**: Optional detailed description
- **Priority**: Low, Medium, or High
- **Status**: Pending, In Progress, or Completed

## API Integration

The frontend connects to the backend API at `http://localhost:5000` and includes:

- JWT token authentication
- RESTful API calls for CRUD operations
- Error handling and loading states
- Automatic token refresh

## Project Structure

```
frontend/
├── public/
│   └── vite.svg           # Vite icon
├── src/
│   ├── app.jsx            # Main React component
│   ├── app.css            # Styles
│   └── index.jsx          # React entry point
├── index.html             # Main HTML file (Vite entry point)
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Troubleshooting

### Common Issues

1. **"URI malformed" errors**
   - This has been resolved by switching to Vite
   - Vite provides faster, more reliable development experience

2. **Backend connection issues**
   - Ensure your backend server is running on `http://localhost:5000`
   - Check that CORS is properly configured on the backend

3. **Port conflicts**
   - If port 3000 is in use, Vite will automatically try the next available port

### Development Tips

- The app uses localStorage to persist authentication tokens
- All API calls include proper error handling
- The UI is fully responsive and works on mobile devices
- Test credentials are displayed on the login page for easy access
- Vite provides instant hot module replacement (HMR)

## Technologies Used

- React 18
- Vite (build tool)
- Modern JavaScript (ES6+)
- CSS3 with Flexbox and Grid
- Fetch API for HTTP requests
- Local Storage for token persistence 