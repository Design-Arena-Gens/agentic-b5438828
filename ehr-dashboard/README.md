# Aurora EHR Demo

Aurora EHR is a full-stack electronic health record demo built with Next.js, Express, and MongoDB. It showcases a role-based workflow for patients, physicians, and administrators featuring scheduling, profile management, and medical record tracking.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS 4
- **Backend**: Express 5 running as a Vercel serverless function
- **Database**: MongoDB via Mongoose ODM
- **Auth**: JWT access tokens with role-based guardrails

## Features

- Secure signup & login for patients and physicians (admins can be seeded manually)
- Patient dashboard with profile editing, appointment booking, and record viewing
- Physician workspace with schedule management, patient roster, and medical record authoring
- Admin console with user directory and global stats
- Responsive hospital-inspired dashboard UI with sidebar navigation and card/table layouts

## Local Development

```bash
# install dependencies
npm install

# start API (http://localhost:4000) and Next.js dev server (http://localhost:3000)
npm run dev:full
```

### Environment Variables

Create a `.env` file (see `.env.example`) with the following values:

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
MONGODB_DB=ehr_demo
JWT_SECRET=replace-with-secure-secret
CORS_ORIGINS=http://localhost:3000,https://agentic-b5438828.vercel.app
```

> The Express server reads the same configuration in both local and serverless modes.

## Available Scripts

- `npm run dev` – Start the Next.js dev server only
- `npm run server` – Start the Express API locally on port 4000
- `npm run dev:full` – Run both servers concurrently for full-stack development
- `npm run build` – Create a production build
- `npm run start` – Start the production Next.js server (requires the API to be deployed separately)
- `npm run lint` – Lint the project with ESLint

## Deployment

The project is configured for Vercel using `vercel.json`:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-b5438828
```

After deployment, verify the production build:

```bash
curl https://agentic-b5438828.vercel.app
```

## API Overview

Base URL defaults to `/api` in production and `http://localhost:4000` locally. All authenticated requests require the `Authorization: Bearer <token>` header.

- `POST /auth/signup` – Register patient or physician
- `POST /auth/login` – Authenticate user
- `GET /users/me` / `PUT /users/me` – Manage current profile
- `GET /users/doctors` – List physicians (all roles)
- `GET /users/patients` – List patients (doctor/admin)
- `GET /users/admin/stats` – Admin dashboard metrics
- `GET|POST /appointments` – View or create appointments
- `PATCH /appointments/:id/status` – Update appointment status (doctor/admin)
- `GET|POST /records` – View or author medical records

## Admin Seeding

Admins are not created through the public signup form. Insert an admin document directly into MongoDB with `role: "admin"` to gain access to the admin console.

## Testing Notes

Integration tests are not included in this demo. Use tools like Thunder Client or Postman to exercise API flows, and run `npm run lint` plus hand testing to validate changes.
