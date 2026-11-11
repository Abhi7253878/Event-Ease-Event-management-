# EventEase – Event Management System

A full-stack MERN platform where attendees discover and book events, organizers create and manage them, and admins moderate the platform.

## Problem statement
Small organizers and campus communities lack a simple way to publish events, control capacity and track registrations; attendees lack one place to discover and book them.

## Objectives
- Role-based platform (attendee / organizer / admin) with secure JWT auth
- Reliable booking: no duplicate registrations, no overbooking, accurate counts on cancel
- Dashboards with analytics for every role

## Features
- **Attendee:** register/login, browse, search, filter (category, date, price), event details, book/cancel, booking history with unique references, profile, notifications
- **Organizer:** create/edit/delete own events, banner upload, capacity & free/paid type, participants list, cancel participants, analytics (Recharts)
- **Admin:** platform stats, manage users (role/disable/delete), moderate/feature/delete events, manage categories
- **Security:** bcryptjs, JWT, role middleware, helmet, CORS, rate limiting, upload type/size validation, input validation, regex-escaped search
- **Paid events:** can be *listed* but **payment is not implemented**; the API rejects booking paid events (no fake checkout)

## Tech stack
React 18 · Vite · Tailwind CSS 3 · React Router 6 · Axios · Lucide · Recharts | Node · Express · Mongoose · JWT · bcryptjs · Multer · Cloudinary (optional) | MongoDB

## Architecture
React SPA → (Vite proxy `/api`) → Express REST API → Mongoose → MongoDB. Images go to `backend/uploads` or Cloudinary if configured.

**Booking integrity:** unique index on `(user, event)`; atomic conditional `$inc` seat claim (`registrationCount < capacity`); a second post-insert check rolls back losers in a race; cancellation flips status atomically so the counter is decremented exactly once.

## Folder structure
```
EventEase/
├── backend/  (config, controllers, middleware, models, routes, utils, uploads, server.js)
├── frontend/ (src: components, layouts, pages, context, hooks, services, utils)
├── package.json  (root: concurrently scripts)
├── start.bat
└── README.md
```

## Installation
Prerequisites: Node 18+, MongoDB running locally (or an Atlas URI).
```bash
npm run install:all        # installs root, backend, frontend
cp backend/.env.example backend/.env   # (start.bat does this automatically)
npm run seed               # demo data
npm run dev                # API :5000 + Web :5173
```
Windows: double-click `start.bat`.

Demo logins (password `password123`): `admin@eventease.com`, `organizer@eventease.com`, `attendee@eventease.com`.

## Environment variables (`backend/.env`)
| Key | Description |
|---|---|
| PORT | API port (5000) |
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Long random secret – **change it** |
| JWT_EXPIRES_IN | e.g. `7d` |
| CLIENT_URL | Allowed CORS origin(s), comma-separated |
| CLOUDINARY_* | Optional cloud image storage |

Frontend (production only): `VITE_API_URL=https://<render-app>.onrender.com/api`

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | auth |
| GET | /api/events?search&category&from&to&free&sort&page&limit | public |
| GET | /api/events/:id | public |
| POST/PUT/DELETE | /api/events[/:id] | organizer (own) / admin |
| POST | /api/registrations `{eventId}` | auth |
| GET | /api/registrations/my · /api/registrations/:id | auth |
| GET | /api/registrations/event/:eventId | organizer (own) / admin |
| DELETE | /api/registrations/:id | owner / organizer / admin |
| GET/PUT | /api/users/profile | auth |
| GET | /api/users/dashboard/attendee · /organizer | auth / organizer |
| GET | /api/notifications · PATCH /:id/read · /read-all | auth |
| GET | /api/admin/dashboard, /users, /events | admin |
| PATCH/DELETE | /api/admin/users/:id | admin |
| GET | /api/admin/categories | public |
| POST/PUT/DELETE | /api/admin/categories[/:id] | admin |

## Testing
Start the API with a seeded DB, then `npm test` – runs 63 automated checks (auth, JWT, roles, CRUD, search/filter, duplicate booking, concurrent capacity race, cancel/re-book counts, admin, uploads). Add Postman by importing the routes above.

## Deployment
- **Database:** MongoDB Atlas → copy URI into `MONGO_URI`
- **Backend (Render):** root `backend`, build `npm install`, start `npm start`, set env vars (`CLIENT_URL` = your Vercel URL). Note: Render's disk is ephemeral – use Cloudinary for images in production.
- **Frontend (Vercel):** root `frontend`, build `npm run build`, output `dist`, env `VITE_API_URL`; add a rewrite of all paths to `/index.html` (`vercel.json`, included).

## Future enhancements
Payment gateway (Razorpay/Stripe) for paid events · email notifications · QR check-in · reviews · calendar export.
