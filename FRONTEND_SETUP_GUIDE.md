# React + Vite + Tailwind CSS Setup Guide

## Complete Step-by-Step Setup

### STEP 1: Create Vite React Project
```powershell
cd c:\depression-predictor
npm create vite@latest frontend -- --template react
```

**Expected output:** Project created with Vite scaffolding

---

### STEP 2: Install Additional Dependencies
```powershell
cd frontend
npm install react-router-dom axios
```

**Packages installed:**
- `react-router-dom` – Client-side routing
- `axios` – HTTP client for API calls

---

### STEP 3: Install Tailwind CSS & Dependencies
```powershell
npm install -D tailwindcss postcss autoprefixer
```

**Packages installed (dev dependencies):**
- `tailwindcss` – Utility-first CSS framework
- `postcss` – CSS tooling
- `autoprefixer` – Vendor prefixes

---

### STEP 4: Initialize Tailwind Configuration
```powershell
npx tailwindcss init -p
```

**Creates:**
- `tailwind.config.js` – Tailwind configuration
- `postcss.config.js` – PostCSS configuration

---

### STEP 5: Configure Template Paths
Replace the generated `tailwind.config.js` with the complete config below.

---

## COMPLETE CONFIG FILES

### 1. `frontend/tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom depression severity colors
        severe: '#ef4444',      // Red - severe
        moderate: '#f97316',    // Orange - moderate
        mild: '#eab308',        // Yellow - mild
        normal: '#22c55e',      // Green - normal
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

### 2. `frontend/src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component styles */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .input-field {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  }

  .badge-severe {
    @apply inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold;
  }

  .badge-moderate {
    @apply inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold;
  }

  .badge-mild {
    @apply inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold;
  }

  .badge-normal {
    @apply inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

---

### 3. `frontend/vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
```

**Key config:**
- **proxy:** Routes `/api/*` calls to `http://localhost:8000` (FastAPI backend)
- **port:** Dev server on port 5173
- **outDir:** Build output to `dist/`

---

### 4. `frontend/package.json` (for reference)
After setup, your `package.json` should look like:
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16",
    "vite": "^5.0.8"
  }
}
```

---

## QUICK TERMINAL COMMANDS (Copy & Paste)

### Windows PowerShell - Complete Setup in One Block:
```powershell
# Navigate to project root
cd c:\depression-predictor

# Create Vite React project
npm create vite@latest frontend -- --template react

# Navigate to frontend
cd frontend

# Install React Router and Axios
npm install react-router-dom axios

# Install Tailwind CSS with dev dependencies
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind configuration
npx tailwindcss init -p

# Start development server
npm run dev
```

---

## FILE UPDATES NEEDED

After running the terminal commands, update these files:

### Update 1: `tailwind.config.js`
- Replace entire file with the config provided above

### Update 2: `src/index.css`
- Add Tailwind directives and custom component styles from above

### Update 3: `vite.config.js`
- Add proxy configuration for `/api` → `http://localhost:8000`

---

## VERIFICATION

### Run Development Server:
```powershell
npm run dev
```

**Expected output:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Test API Proxy:
In your React component, API calls like:
```javascript
axios.get('/api/predict')
```
Will be forwarded to: `http://localhost:8000/predict`

---

## PROJECT STRUCTURE AFTER SETUP

```
frontend/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── index.css          ← Add Tailwind directives here
│   ├── main.jsx
│   └── App.css
├── index.html
├── package.json
├── package-lock.json
├── tailwind.config.js     ← Update with provided config
├── postcss.config.js      ← Auto-generated
└── vite.config.js         ← Add proxy configuration
```

---

## TROUBLESHOOTING

### Issue: "Tailwind styles not applying"
**Solution:** Make sure `src/index.css` is imported in `src/main.jsx`:
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'  // ← Must import this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### Issue: CORS errors when calling backend
**Solution:** The proxy in `vite.config.js` handles this. Make sure:
- FastAPI backend is running on `http://localhost:8000`
- Vite dev server is running on `http://localhost:5173`
- API calls use `/api/` prefix (e.g., `/api/predict`)

### Issue: Port 5173 already in use
**Solution:** Change port in `vite.config.js`:
```javascript
server: {
  port: 5174,  // Change to available port
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

---

## NEXT STEPS

1. Update config files as specified
2. Run `npm run dev`
3. Visit `http://localhost:5173`
4. Start building components in `src/components/`
5. Use Tailwind classes or custom component styles from `index.css`

