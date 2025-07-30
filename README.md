# Task Management QA Automation

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/akshatasp05/REM-Waste-QA-Assessment.git
cd REM-Waste-QA-Assessment
git checkout integration
```

### 2. Start Frontend Server
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: http://localhost:3000

### 3. Start Backend Server
```bash
cd backend
npm install  
npm run dev
```
Backend runs on: http://localhost:5000

### 4. Run Tests

#### UI Tests (Playwright)
```bash
npm run test:e2e
```

#### API Tests (Newman)
```bash
# Install Newman globally
npm install -g newman

# Run API tests
cd backend/postman
newman run taskManagement.json
```

## Requirements
- Node.js (v16+)
- npm (v8+)

Keep both servers running in separate terminals during testing.
