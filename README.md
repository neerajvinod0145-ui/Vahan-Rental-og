# VahanaShare — Bike and Vehicle Sharing System

A beginner-friendly MERN starter project for sharing and renting bikes and cars. It is based on the supplied project abstract: user accounts, vehicle browsing, booking management, an Express REST API, MongoDB storage, and a basic admin role.

## Features in this starter

- Register and log in with hashed passwords and JWT authentication
- Browse available vehicles
- Add vehicles (admin only)
- Create and view your bookings
- Basic booking conflict check for the same vehicle and overlapping dates
- React + Vite frontend, Express backend, MongoDB/Mongoose database
- `.env.example` files and `.gitignore` to help protect secrets

This is a **starter project**, not a production-ready rental platform. Before real-world use, add payment processing, identity/license verification where legally required, stronger validation/rate limiting, email notifications, audit logs, tests, and deployment hardening.

## Technology

- Frontend: React, Vite, React Router
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Authentication: bcryptjs + JSON Web Tokens

## Requirements

Install:
- Node.js LTS (includes npm)
- Git
- A MongoDB database: local MongoDB or a MongoDB Atlas cluster
- Visual Studio Code (recommended)

Check Node and Git:
```bash
node -v
npm -v
git --version
```

## 1. Configure the backend

Open a terminal in the project folder:
```bash
cd server
npm install
```

Copy `.env.example` to `.env`, then update the values:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vahanashare
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string. Keep `.env` private; never commit it to GitHub.

Start the backend:
```bash
npm run dev
```
The API should run at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## 2. Configure the frontend

Open a **second terminal** from the project root:
```bash
cd client
npm install
```

Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start React:
```bash
npm run dev
```
Open the local URL shown by Vite, usually `http://localhost:5173`.

## 3. Create an admin account

Register through the website first. To grant that account admin access, use MongoDB Compass or the MongoDB shell to update that user's `role` field to `admin`.

Example MongoDB shell commands:
```javascript
use vahanashare
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```
Use the same database name as the one in your connection string. Do not add public admin registration to the application.

After changing the role, log out and log in again to get a new token.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API status |
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Log in |
| GET | `/api/vehicles` | Public | List vehicles |
| POST | `/api/vehicles` | Admin | Add vehicle |
| GET | `/api/bookings/my` | Logged in | View your bookings |
| POST | `/api/bookings` | Logged in | Create booking |

Dates should be sent as ISO date strings such as `2026-11-01`.

## Git and private GitHub repository

Run these commands from the **VahanaShare project root**. First check that Git is installed and you are signed in to GitHub in VS Code or your browser.

```bash
git init
git add .
git status
git commit -m "Initial VahanaShare MERN starter"
git branch -M main
```

Create a **new private repository** named `VahanaShare` at https://github.com/new. Do not initialize it with a README, license, or `.gitignore` because those are already included here.

Then connect your new repository (replace `YOUR-USERNAME` with your GitHub username):
```bash
git remote add origin https://github.com/YOUR-USERNAME/VahanaShare.git
git push -u origin main
```

This uploads the project to your private repository only after you run the commands and authenticate. I have not accessed or published anything to your GitHub account.

For later changes:
```bash
git add .
git commit -m "Describe your change"
git push
```

## Suggested next improvements

1. Add vehicle images and filters by category/location/price.
2. Add booking cancellation and admin booking management.
3. Add email notifications.
4. Add tests and deploy the frontend/API.
5. Add a polished responsive design and accessibility improvements.
