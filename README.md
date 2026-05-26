# Ekart-yt

> A full-stack e-commerce application (React + Node.js) with user auth, product management, cart, orders, media uploads, promotions, reviews, and admin features.

## Features

- User registration, login, and profile management
- Product listing, categories, and search
- Cart and order processing
- Admin panel for product, order, coupon, and promotion management
- Image/media upload support (Cloudinary)
- Email verification and OTP flows

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (or compatible)
- Media: Cloudinary

## Repository Structure

- `backend/` — Express API, controllers, models, routes, uploads
- `frontend/` — React app (Vite), pages, components, redux
- `DEPLOYMENT.md` — Deployment notes

## Prerequisites

- Node.js (v16+ recommended)
- npm or pnpm
- MongoDB instance (local or hosted)
- Cloudinary account (for media uploads)

## Environment Variables

Create a `.env` file in `backend/` with at least the following variables (names here are examples; check `backend` code for exact names):

- `MONGO_URI` — MongoDB connection string
- `PORT` — Backend server port (e.g. 5000)
- `JWT_SECRET` — Secret for signing JWTs
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary credentials
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — Email settings (if used)

## Setup

1. Clone the repo

```bash
git clone <repo-url>
cd Ekart-yt
```

2. Backend

```bash
cd backend
npm install
# start in development
node server.js
# or if package.json has scripts: npm start or npm run dev
```

3. Frontend

```bash
cd frontend
npm install
npm run dev
# build for production
npm run build
```

## Running Locally (example)

1. Start MongoDB (or ensure your hosted DB is reachable)
2. Create `.env` in `backend/` with values above
3. Start backend: `node server.js` (or `npm run dev`)
4. Start frontend: `npm run dev` in `frontend/`
5. Visit `http://localhost:5173` (default Vite port) and the API at `http://localhost:5000` (or your `PORT`)

## Deployment

- See `DEPLOYMENT.md` for platform-specific notes. Typical steps:
  - Build frontend (`npm run build`) and serve static files or deploy to Vercel/Netlify
  - Deploy backend to Heroku, Render, Railway, or a VPS
  - Provide production environment variables for DB, Cloudinary, and email

## Contributing

Contributions are welcome. Please open issues or pull requests with a clear description of changes. For larger changes, open an issue first to discuss the design.

## Troubleshooting

- If uploads fail, verify Cloudinary credentials in the backend env and that `utils/cloudinary.js` is configured
- If the frontend cannot call the API, confirm CORS settings and correct API base URL in `frontend/lib/api.js`

## Credits

This project was developed as a full-stack e-commerce example with separate frontend and backend folders. See individual folders for more details.

## License

Specify a license (e.g., MIT) in the repo root if you want this project to be open-source.

## Contact

For questions, open an issue or contact the maintainer.
