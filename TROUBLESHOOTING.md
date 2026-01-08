# Troubleshooting Guide

## Problem: "Backend not available" Error

### Cause 1: Backend isn't running
**Solution:**
```bash
npm run dev:backend
```
Or check if it's already running:
- Windows: Check taskbar or run `netstat -ano | findstr :5000`
- Mac/Linux: Run `lsof -i :5000`

### Cause 2: OPENAI_API_KEY not set
**Solution:**
1. Open `BackEnd/.env`
2. Add: `OPENAI_API_KEY=your_actual_key_here`
3. Restart backend: `npm run dev:backend`

### Cause 3: Port 5000 already in use
**Solution:**
Edit [BackEnd/server.js](BackEnd/server.js), change:
```javascript
const PORT = process.env.PORT || 5000;
```
To:
```javascript
const PORT = process.env.PORT || 5001;  // Use 5001 instead
```

Then update [analyzer.js](analyzer.js) to use new port:
```javascript
const API_URL = 'http://localhost:5001';
```

---

## Problem: Port 5173 already in use

### Solution:
Edit `vite.config.js`:
```javascript
server: {
  port: 5174,  // Change to available port
  // ... rest of config
}
```

---

## Problem: "concurrently" command not found

### Solution:
```bash
npm install concurrently
```

---

## Problem: Module not found errors

### Solution:
Reinstall all dependencies:
```bash
npm run install:all
```

---

## Problem: Changes not reflecting in browser

### Solutions:
1. **Clear cache & hard refresh**:
   - Windows/Linux: `Ctrl + Shift + Delete`
   - Mac: `Cmd + Shift + Delete`

2. **Restart Vite dev server**:
   - Stop: `Ctrl + C` in frontend terminal
   - Start: `npm run dev:frontend`

3. **Check file was saved** - Confirm you saved the file in VS Code

---

## Problem: CORS errors in browser console

### Cause: Backend not responding
**Solution:**
Check backend console for errors:
```bash
npm run dev:backend
```

Should see: `Backend running on port 5000`

If not, check for:
- OpenAI API key is valid
- Dependencies installed: `cd BackEnd && npm install`

---

## Problem: "Cannot find module 'express'" or similar

### Solution:
```bash
cd BackEnd
npm install
```

---

## Problem: OpenAI API errors

### Check 1: API key validity
- Go to https://platform.openai.com/account/api-keys
- Verify your API key is active and has credits

### Check 2: Request quota
- Model used: `gpt-4o-mini` (cost-effective)
- Check your usage at https://platform.openai.com/account/usage/overview

### Solution:
Update `.env`:
```
OPENAI_API_KEY=sk-your-valid-key-here
```

---

## Problem: Browser shows blank page

### Solutions:

1. **Check frontend is running**:
   - Open browser console: `F12` > Console
   - Look for errors
   - Refresh: `Ctrl + R`

2. **Verify Vite server**:
   - Should see console message: "VITE v5.x.x  ready in xxx ms"
   - URL should be `http://localhost:5173`

3. **Check all dependencies**:
   ```bash
   npm run install:all
   ```

---

## Problem: Slow responses or timeouts

### Cause: OpenAI API slow
**Solution:**
- This is normal for first request (model loading)
- Subsequent requests use cache (instant)
- Check OpenAI status: https://status.openai.com/

### If consistently slow:
- Your OpenAI plan may have rate limits
- Upgrade plan at https://platform.openai.com/account/billing/overview

---

## Problem: Can't login

### Check demo credentials:
- Email: `student@ece.com`
- Password: `password123`

These are hardcoded in [auth.js](auth.js)

### Create custom user:
Edit [auth.js](auth.js#L3):
```javascript
const users = {
  'student@ece.com': { password: 'password123', name: 'ECE Student' },
  'yourname@example.com': { password: 'yourpass', name: 'Your Name' }  // Add this
};
```

---

## Problem: Running both commands together won't work

### Instead of:
```bash
npm run dev:frontend && npm run dev:backend
```

### Use:
```bash
npm run dev
```

Or open two terminals:
```bash
# Terminal 1
npm run dev:frontend

# Terminal 2  
npm run dev:backend
```

---

## How to Restart Everything

### Complete reset:
```bash
# Stop everything (Ctrl + C in all terminals)

# Clear caches
rmdir /s node_modules
cd BackEnd && rmdir /s node_modules && cd ..
del package-lock.json
cd BackEnd && del package-lock.json && cd ..

# Reinstall
npm run install:all

# Start fresh
npm run dev
```

---

## Getting Help

1. **Check browser console**: `F12` > Console tab for errors
2. **Check terminal output**: Read all console messages
3. **Review logs in [BackEnd/server.js](BackEnd/server.js)**: Add `console.log()` for debugging
4. **Verify settings**:
   - Backend port: [BackEnd/server.js](BackEnd/server.js#L113)
   - Frontend port: [vite.config.js](vite.config.js#L8)
   - API URL: [analyzer.js](analyzer.js#L2)

---

**Still stuck?** Check these files in order:
1. [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
2. [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
3. [BackEnd/server.js](BackEnd/server.js) - Check logs
4. Browser DevTools Console - Check errors
