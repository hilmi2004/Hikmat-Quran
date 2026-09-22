# 🚀 Railway Deployment Guide - Hikmat Quran Backend

This repository is pre-configured for seamless 1-click deployment on [Railway](https://railway.com).

The backend is built with **Node.js, Express, and TypeScript**, listening dynamically on `0.0.0.0:$PORT`, with built-in health checks (`/api/health`), CORS configuration, and graceful shutdown handlers.

---

## ⚡ Option 1: Deploy via Railway Web Dashboard (Recommended)

### Step 1: Push Code to GitHub
Ensure your latest changes are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Railway backend deployment"
git push origin main
```

### Step 2: Create a New Project on Railway
1. Go to [railway.com](https://railway.com) and log in.
2. Click **"+ New Project"**.
3. Select **"Deploy from GitHub repo"**.
4. Choose your `Hikmat-Quran` repository.

### Step 3: Configure Service (Root or Server Directory)
Railway will automatically detect the configuration:
- **Default (Zero-Config)**: The root `Dockerfile` and `railway.json` will automatically build the backend container.
- **Alternative (Subdirectory)**: If you prefer setting the service root to the server folder:
  1. Go to **Settings** > **General** > **Root Directory**.
  2. Set **Root Directory** to `/server`.
  3. Railway will use `server/Dockerfile` and `server/railway.json`.

### Step 4: Add Environment Variables
In your Railway project dashboard, navigate to the **Variables** tab and set:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment flag |
| `PORT` | `5000` *(Railway provides this automatically)* | Port the backend listens on |
| `CORS_ORIGIN` | `*` *(or your frontend URL)* | Allowed origins (e.g. `https://your-frontend.vercel.app`) |

*(Railway automatically sets `$PORT` during container startup, and the backend binds to `0.0.0.0:$PORT` automatically).*

### Step 5: Generate a Public Domain
1. In the Railway dashboard, click on your backend service.
2. Go to **Settings** > **Networking** > **Public Networking**.
3. Click **"Generate Domain"** (or add your custom domain).
4. You will get a URL like `https://hikmat-quran-server-production.up.railway.app`.

### Step 6: Test the Backend
Open your generated Railway URL in your browser:
- `https://<your-service>.up.railway.app/` &rarr; Returns API metadata & online status
- `https://<your-service>.up.railway.app/api/health` &rarr; Health check (`uptimeSeconds`, `status: "online"`)
- `https://<your-service>.up.railway.app/api/manifest` &rarr; Verified Quran dataset package manifest

---

## 💻 Option 2: Deploy via Railway CLI

If you prefer using the command line:

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize and Link**:
   ```bash
   railway init
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Generate a Domain**:
   ```bash
   railway domain
   ```

---

## 🔗 Connecting Your Frontend (Client)

To connect your React frontend to your deployed Railway backend:

### In Local Development (`client/.env`):
```env
VITE_API_BASE_URL=https://<your-railway-service>.up.railway.app
```

### In Production Frontend (Vercel / Netlify / Cloudflare Pages / Railway):
Add the environment variable in your frontend host's dashboard:
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://<your-railway-service>.up.railway.app`

Once set, the offline-first sync feature in `client/src/pages/Progress.tsx` will automatically push backup syncs to your Railway backend!

---

## 🛡️ Architecture & Production Features Included

- **Dynamic IP & Port Binding**: Binds to `0.0.0.0` (Railway's internal routing requirement) using `process.env.PORT`.
- **Health Checks**: Pre-configured `/api/health` and `/health` endpoints with automatic retry and 120s timeout in `railway.json`.
- **Lightweight Multi-Stage Docker**: Strips devDependencies and produces a minimal Alpine Node 20 runner container.
- **Graceful Shutdown**: Catches `SIGTERM` and `SIGINT` signals so container updates and redeploys zero-downtime drain active requests.
- **Configurable CORS**: Supports single domains, comma-separated lists, or universal wildcard `*`.
