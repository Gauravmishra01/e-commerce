# Ekart Deployment Guide (Render + Vercel)

## 1) Backend (Render)

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm run start`
- Health check path: `/health`

Set these environment variables in Render:

- `PORT=8000`
- `NODE_ENV=production`
- `MONGO_URI=<your_mongodb_connection_string>`
- `SECRET_KEY=<strong_random_secret>`
- `CLIENT_URLS=https://<your-vercel-domain>,https://<your-preview-domain>.vercel.app`
- `CLIENT_URL=https://<your-vercel-domain>`
- `FRONTEND_URL=https://<your-vercel-domain>`
- `ALLOW_VERCEL_PREVIEWS=true` (optional)
- `CLOUD_NAME=<cloudinary_cloud_name>`
- `API_KEY=<cloudinary_api_key>`
- `API_SECRET=<cloudinary_api_secret>`
- `MAIL_USER=<gmail_address>`
- `MAIL_PASS=<gmail_app_password>`

## 2) Frontend (Vercel)

- Root directory: `frontend`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

Set these environment variables in Vercel:

- `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api/v1`

If local development is needed:

- `VITE_API_PROXY_TARGET=http://localhost:8000`

## 3) Post-deploy checks

- Open `https://<render-app>.onrender.com/health` and verify success response.
- Open frontend and verify:
  - signup + email verification link points to Vercel domain
  - login/logout
  - product listing and image loading
  - cart add/update/remove
  - checkout from cart (creates order)
  - admin login and orders list

## 4) Common pitfalls solved in this repo

- Hardcoded localhost verification links
- Frontend API fallback causing wrong backend calls in production
- Profile image upload failing due to multer memory storage
- Missing customer checkout/order APIs
- SPA route refresh 404 on Vercel
