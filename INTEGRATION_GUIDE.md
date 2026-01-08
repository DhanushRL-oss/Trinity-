# Skill Gap Analyzer - Integrated Setup Guide

## Project Structure

```
FrontEnd/
├── BackEnd/                    # Backend Node.js + Express server
│   ├── server.js
│   ├── package.json
│   └── .env                    # Backend environment variables
├── src/                        # Frontend React components
├── index.html
├── analyzer.js
├── auth.js
├── uiController.js
├── style.css
├── vite.config.js
├── package.json                # Root package.json (updated with integrated scripts)
└── my-frontend-app/            # Alternative React setup (optional)
```

## Installation

### One-time Setup
```bash
# Install all dependencies for both frontend and backend
npm run install:all
```

This command will:
1. Install frontend dependencies (React, Vite, Axios, etc.)
2. Install backend dependencies (Express, OpenAI, CORS, etc.)

## Running the Application

### Option 1: Run Both Frontend and Backend Together (Recommended)
```bash
npm run dev
```

This will:
- Start the **Vite dev server** on `http://localhost:5173`
- Start the **Express backend** on `http://localhost:5000`
- Both run concurrently in the same terminal

### Option 2: Run Components Separately

**Frontend only:**
```bash
npm run dev:frontend
```
Runs on `http://localhost:5173`

**Backend only:**
```bash
npm run dev:backend
```
or
```bash
npm start
```
Runs on `http://localhost:5000`

## Configuration

### Backend Environment Variables
Create a `.env` file in the `BackEnd/` folder:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### API Connection
The frontend is configured to connect to `http://localhost:5000`. This is set in [analyzer.js](analyzer.js#L2).

## Key Files

- **Backend API**: [BackEnd/server.js](BackEnd/server.js)
- **Frontend Analyzer**: [analyzer.js](analyzer.js) - Handles API calls
- **Frontend Auth**: [auth.js](auth.js) - Handles login/signup
- **Frontend UI**: [uiController.js](uiController.js) - Manages page navigation

## How It Works

1. **User logs in** via the frontend (credentials in [auth.js](auth.js))
2. **User enters career goal and current skills** in the frontend form
3. **Frontend sends request** to backend API endpoint `/get-missing-roadmap`
4. **Backend uses OpenAI API** to analyze skills gap and generate a learning roadmap
5. **Response is cached** to optimize repeated queries
6. **Frontend displays the roadmap** to the user

## Troubleshooting

### Backend not responding
- Make sure `npm run dev:backend` is running
- Check that port 5000 is available
- Verify `.env` file has correct `OPENAI_API_KEY`

### Port already in use
If ports 5000 or 5173 are already in use, you can modify:
- **Frontend port**: Edit `vite.config.js`
- **Backend port**: Edit [BackEnd/server.js](BackEnd/server.js) to change the listen port

### CORS issues
CORS is already enabled in [BackEnd/server.js](BackEnd/server.js). If you still see CORS errors:
- Check that backend is running on `http://localhost:5000`
- Verify `Origin` header matches frontend URL

## Scripts Summary

| Command | Purpose |
|---------|---------|
| `npm run dev` | Run frontend + backend together |
| `npm run dev:frontend` | Frontend only (Vite dev server) |
| `npm run dev:backend` | Backend only (Node.js Express) |
| `npm run build` | Build frontend for production |
| `npm run install:all` | Install all dependencies |

---

**Status**: Both frontend and backend are now integrated and can be run from the root directory!
