## Appointment Setting Application

This repository contains a full-stack appointment booking application:

- **Frontend**: React + Vite (multi-step flow to book bank appointments)
- **Backend**: Node.js + Express
- **Database**: SQLite (file-based, stored in `backend/appointments.db`)

Anyone can clone this repo and run the full app locally.

---

## Features

- **Step-by-step booking flow**
  - Select appointment topic
  - Choose branch (filtered by topic)
  - Pick date
  - Pick a 30-minute time slot
  - Enter personal details and confirm

- **Availability logic**
  - Business hours:
    - Mon–Fri: 9:00–17:00 with a lunch break 12:00–13:00
    - Sat: 9:00–13:00
    - Sun: closed
  - Once a time slot is booked, it is:
    - Stored in the SQLite database
    - Marked unavailable in future queries
    - Shown as **disabled / grayed out** in the UI

- **Persistent storage**
  - All appointments are stored in `backend/appointments.db`
  - The DB file is committed to git so the data snapshot can be versioned in GitHub if you choose to push it

For detailed frontend documentation, see `src/README.md`. For API details, see `src/API_DOCUMENTATION.md`.

---

## Prerequisites

- Node.js **18+** recommended
- npm (comes with Node)

No separate database server is required; SQLite is embedded and stored in a local file.

---

## Getting Started

Clone the repository:

```bash
git clone https://github.com/BryceCounts1/Appointmentsettingapplication.git
cd Appointmentsettingapplication
```

Install dependencies:

```bash
npm install
```

This installs both frontend and backend dependencies (React, Vite, Express, SQLite driver, etc.).

---

## Running the Application

You need **two terminals**: one for the backend and one for the frontend.

### 1. Start the backend (API + SQLite)

From the project root:

```bash
npm run server
```

This starts the Express server on `http://localhost:3001` with these endpoints:

- `GET /api/topics`
- `GET /api/branches?topicId={topicId}`
- `GET /api/appointments/available-dates?branchId={branchId}`
- `GET /api/appointments/available-slots?branchId={branchId}&date={date}`
- `POST /api/appointments`

The SQLite database file is automatically created at `backend/appointments.db` if it does not exist.

### 2. Start the frontend (React + Vite)

In a **second terminal**, still in the project root:

```bash
npm run dev
```

By default, Vite will start on `http://localhost:5173`.

Open that URL in your browser and you can:

1. Log in (simple mock login)
2. Select a topic
3. Choose a branch
4. Pick a date
5. Pick a time
6. Enter your details and confirm

The frontend is already configured to talk to the Node backend at `http://localhost:3001/api` via `src/services/api.ts`.

---

## Database Behavior and Resetting

- All appointments are stored in `backend/appointments.db`.
- The backend uses a unique constraint on `(branch_id, date_time)` to prevent double-booking a time slot.
- Time slots are generated on the fly based on business hours and marked as available/unavailable by checking existing bookings in the DB.

### Email confirmations

When an appointment is booked, the backend can send a confirmation email via [Resend](https://resend.com) (API key only, no password):

1. Sign up at [Resend](https://resend.com) and create an API key at [resend.com/api-keys](https://resend.com/api-keys).
2. Copy `backend/.env.example` to `backend/.env` and set `RESEND_API_KEY=re_xxxx` (your key).
3. Restart the backend (`npm run server`).

**Sending to any email:** Resend’s default “from” (`onboarding@resend.dev`) can only deliver to the email address on your Resend account. To send to any customer (e.g. the email they enter when booking), you must add and verify a domain at [resend.com/domains](https://resend.com/domains), then set `RESEND_FROM=Appointments <you@yourdomain.com>` in `.env`. Free tier: 100 emails/day. If email is not configured, appointments still save; the server logs a warning. Do not commit `.env` (it is in `.gitignore`).

---

### Resetting all appointments

If you want to clear **all** appointments and make every slot available again, you have two options:

**Option A: Delete the DB file (it will be recreated)**  

```bash
rm backend/appointments.db
npm run server
```

**Option B: Clear the table using SQLite CLI (if installed)**  

```bash
sqlite3 backend/appointments.db "DELETE FROM appointments;"
```

---

## Using This Repo as a Starter

If you want to use this as a starting point for your own project:

1. Clone or fork the repository.
2. Update the GitHub remote to your own URL (if needed).
3. Adjust branding, copy, and styling in the React components (mainly under `src/components` and `src/App.tsx`).
4. Extend the backend (`backend/server.js`) and database schema (`backend/db.js`) as needed:
   - Add authentication
   - Add user accounts
   - Add cancellation or rescheduling endpoints

You can also replace the SQLite database with a hosted database (Postgres, MySQL, etc.) by swapping out the `better-sqlite3` usage in `backend/db.js`.

---

## Original Design

The original design for this application is available in Figma:

`https://www.figma.com/design/PG1H2REk8mQcf3dn7ggnaF/Appointment-Setting-Application`

---

## License / Usage

This is a learning/demo project intended to be easy to run locally and adapt.  
You are free to clone, modify, and use it for coursework, prototypes, or internal demos.  
If you publish a public derivative, consider crediting the original design and this repository.
