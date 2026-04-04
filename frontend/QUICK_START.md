# React + Vite + Tailwind CSS - Quick Terminal Setup

## COMPLETE ONE-LINER SETUP (Windows PowerShell)

### Option 1: Step-by-Step (Recommended - see output at each step)
```powershell
cd c:\depression-predictor\frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm run dev
```

### Option 2: Fast Setup (If dependencies already listed in package.json)
```powershell
cd c:\depression-predictor\frontend
npm install
npm run dev
```

---

## WHAT'S BEEN CONFIGURED

✅ **Files Created/Updated:**
- `tailwind.config.js` – Content paths configured
- `vite.config.js` – API proxy to http://localhost:8000
- `src/index.css` – All Tailwind directives + custom components
- `src/main.jsx` – React entry point with CSS import
- `src/App.jsx` – Router setup with all pages
- `package.json` – All dependencies defined
- `index.html` – Vite entry point

✅ **Custom Tailwind Components in index.css:**
- `.btn-primary` – Primary button style
- `.btn-secondary` – Secondary button style
- `.card` – Card container
- `.input-field` – Form input styling
- `.badge-*` – Severity badges (severe, moderate, mild, normal)

✅ **Custom Theme Colors:**
- `severe` – #ef4444 (Red)
- `moderate` – #f97316 (Orange)
- `mild` – #eab308 (Yellow)
- `normal` – #22c55e (Green)

---

## INSTALL & RUN

```powershell
cd c:\depression-predictor\frontend
npm install
npm run dev
```

**Development Server:**
- 🌐 **URL:** http://localhost:5173
- 📚 **Hot Reload:** Enabled (auto-refreshes on file changes)
- 🔗 **API Proxy:** `/api/*` → `http://localhost:8000`

---

## API INTEGRATION EXAMPLE

When making API calls, use the `/api` prefix:

```javascript
// In your React component
import axios from 'axios'

async function getPrediction(text) {
  const response = await axios.post('/api/predict', {
    text: text
  })
  return response.data
}
```

The Vite proxy will forward this to: `http://localhost:8000/predict`

---

## BUILD FOR PRODUCTION

```powershell
npm run build
```

**Output:** Optimized files in `frontend/dist/`

---

## TROUBLESHOOTING

### Port 5173 in use?
Edit `vite.config.js`:
```javascript
server: {
  port: 5174,  // Change to available port
  ...
}
```

### Tailwind styles not showing?
1. Make sure `src/index.css` is imported in `src/main.jsx`
2. Check that `tailwind.config.js` has correct content paths
3. Clear browser cache (Ctrl+Shift+Delete)

### CORS errors?
The Vite proxy should handle this. Make sure:
- `/api` prefix is used in API URLs
- Backend is running on `http://localhost:8000`
- Using `http://localhost:5173` in browser (not 127.0.0.1)

---

## DEPENDENCIES INSTALLED

**Production:**
- `react` – UI library
- `react-dom` – React DOM rendering
- `react-router-dom` – Client-side routing
- `axios` – HTTP client

**Development:**
- `vite` – Build tool
- `@vitejs/plugin-react` – React support
- `tailwindcss` – Utility CSS
- `postcss` – CSS processing
- `autoprefixer` – Vendor prefixes

---

## NEXT STEPS

1. ✅ Run `npm install` to download all dependencies
2. ✅ Run `npm run dev` to start dev server
3. ✅ Build React pages in `src/pages/`
4. ✅ Create components in `src/components/`
5. ✅ Use Tailwind classes or custom styles from `index.css`
6. ✅ Connect to FastAPI backend via `/api` routes
