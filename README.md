# MediCura

MediCura is a full-stack medical clinic management system combining a React/Vite frontend and an Express/Node.js backend. It provides appointment booking, inventory management, invoicing, user authentication, and administrative dashboards tailored for clinics, pharmacies, and lab assistants.

This repository contains multiple app folders (admin, frontend, backend, backend1, backend2) reflecting different services and historical iterations. The main active components are:

- `frontend/` — Primary React (Vite) client app.
- `admin/` — Admin dashboard frontend (Vite + React + Tailwind).
- `backend/` — Express backend with controllers, models, routes, services, middlewares, templates, and uploads support. This is the core API server.
- `src/` (root-level) — Another front-end app used for the main client (possible previous version). Contains keys and other front-end sources.

## Table of Contents

- [Features](#features)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Environment & configuration](#environment--configuration)
- [Local setup (Windows - cmd.exe)](#local-setup-windows---cmdexe)
  - [Backend](#backend)
  - [Frontend (client)](#frontend-client)
  - [Admin dashboard](#admin-dashboard)
- [Testing](#testing)
- [Deployment notes](#deployment-notes)
- [Contributing](#contributing)
- [License](#license)
- [Contact / Maintainers](#contact--maintainers)

## Features

- User authentication (patients, admin, staff)
- Appointment booking and management
- Inventory management with requests and invoices
- Cart and billing features
- Employee payments and expense tracking
- File uploads (images, documents) and Cloudinary integration support
- Role-based middlewares and caching

## Repository layout

Top-level folders of interest:

- `admin/` — Admin dashboard project (Vite + React + Tailwind).
- `frontend/` — Another front-end Vite project (client-facing).
- `src/` (root) — Front-end source used by a previous/main client app.
- `backend/` — Primary Express API server with:
  - `controllers/` — Route handlers and business logic
  - `models/` — Mongoose models and schemas
  - `routes/` — Express routes
  - `middlewares/` — Auth, file upload, caching, etc.
  - `config/` — DB and Cloudinary config
  - `services/` — Reusable services like cart and client services
  - `uploads/` — Local upload storage

There are also `backend1/` and `backend2/` which appear to be earlier or experimental backends. Treat them as archives unless you know otherwise.

## Prerequisites

- Node.js >= 16 (recommended) and npm (or yarn)
- MongoDB (local or remote Atlas)
- Cloudinary account (optional, for image uploads)
- Windows (commands below use cmd.exe)

## Environment & configuration

Sensitive keys and environment variables should be set in `.env` files (not committed). Typical vars used by the projects:

For the backend (`backend/.env`):

- PORT - server port (e.g. 5000)
- MONGO_URI - MongoDB connection string
- JWT_SECRET - JSON Web Token secret
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- PAYHERE_* or payment gateway keys (if used)

For frontends (`frontend/.env`, `admin/.env`, `src/.env`) you may find keys like:

- VITE_API_URL or REACT_APP_API_URL - API base URL
- VITE_MAP_KEY - map or third-party keys

Check `src/keys.js`, `admin/.env`, and `frontend/.env` for project-specific keys.

## Local setup (Windows - cmd.exe)

We'll provide steps for the main backend and the two frontends. Run commands from the repository root.

### Backend (API)

1. Open cmd.exe and change to the backend folder:

   cd backend

2. Install dependencies:

   npm install

3. Create a `.env` file in `backend/` using the sample variables above.

4. Start the server in development mode (if `npm run dev` exists) or start normally:

   npm run dev
   REM or
   npm start

The server should start on the configured `PORT` and connect to MongoDB.

### Frontend (client)

1. Change into the frontend folder (choose the appropriate client folder; `frontend/` or root `src/` depending on which app you use):

   cd frontend

2. Install dependencies and start dev server:

   npm install
   npm run dev

Open the URL printed by Vite (usually http://localhost:5173) in your browser.

### Admin dashboard

Repeat the same steps inside the `admin/` folder:

   cd admin
   npm install
   npm run dev


## Testing

- Unit/integration tests are not included by default. If you add tests, use the project's package.json test scripts.

## Deployment notes

- Build frontends with `npm run build` inside each frontend folder and serve using any static host or reverse proxy.
- Backend: ensure `MONGO_URI` and secret keys are set in production env. Use process managers like PM2 or Docker.
- For uploads and media, configure Cloudinary and update `config/cloudinary.js`.


## Contact / Maintainers

Project owner: (Sineth Dinsara/sineth1211@gmail.com)
