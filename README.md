## The Care Nexus – Backend

Production-ready Node.js/Express backend for a healthcare management platform with RBAC, JWT auth, MongoDB, Redis, and Socket.io chat support.

### Tech Stack

- **Runtime**: Node.js (Express.js)
- **Database**: MongoDB (Mongoose)
- **Cache/Sessions**: Redis
- **Auth**: JWT access + refresh tokens (stored in Redis)
- **Real-time**: Socket.io

### Setup & Run

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Copy `.env.example` to `.env` and adjust values:

```bash
cp .env.example .env
```

Set at least:

- `MONGODB_URI`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

3. **Run MongoDB and Redis locally**

- MongoDB on `mongodb://localhost:27017`
- Redis on `redis://localhost:6379`

4. **Start the server**

- Development:

```bash
npm run dev
```

- Production:

```bash
npm start
```

Server runs by default on `http://localhost:5000`.

### Folder Structure (key parts)

- `src/config` – app/mongo/redis configuration
- `src/models` – Mongoose schemas (User, Clinic, Appointment, MedicalReport, Payment, Message, etc.)
- `src/middlewares` – auth, RBAC, error handling
- `src/modules`
  - `auth` – registration/login/logout/refresh
  - `admin` – super admin clinic/user management
  - `clinic` – clinic admin clinic management
  - `doctor` – doctor profile, availability, appointments, reports, payments
  - `patient` – patient profile, appointments, reports, payments, access grant/revoke, history
  - `chat` – appointment-based chat messages
  - `system` – health, logs, errors, backup (admin-only)
  - `notifications` – list, mark read; auto-created on appointment events
  - `analytics` – admin/clinic/doctor overview (aggregations)
- `src/services` – log, notification, cron, access
- `src/routes` – mounts feature routes under `/api/v1`
- `src/app.js` – Express app, security middleware, routing
- `src/server.js` – HTTP + Socket.io bootstrap, cron jobs
- `docs/BACKEND_FREEZE_CHECKLIST.md` – backend freeze readiness checklist

### Core API Prefix

All REST APIs are under:

`/api/v1`

Health check:

`GET /health`

---

### Authentication & RBAC

- **Register patient**: `POST /api/v1/auth/register`
- **Login**: `POST /api/v1/auth/login`
- **Refresh tokens**: `POST /api/v1/auth/refresh-token`
- **Logout**: `POST /api/v1/auth/logout`
- **Get current user**: `GET /api/v1/auth/me` (requires `Authorization: Bearer <accessToken>`)

Roles:

- `SUPER_ADMIN`
- `CLINIC_ADMIN`
- `DOCTOR`
- `PATIENT`

Protected routes use JWT access tokens and role-based authorization.

---

### Module Endpoints (Overview)

#### Auth (`/api/v1/auth`)

- `POST /register` – patient self-registration
- `POST /login` – login, returns access + refresh tokens
- `POST /refresh-token` – rotate tokens
- `POST /logout` – revoke refresh token
- `GET /me` – current authenticated user

#### Admin (`/api/v1/admin`) – `SUPER_ADMIN` only

- `GET /clinics` – list all clinics
- `PATCH /clinics/:id/status` – approve/suspend clinic
- `GET /users` – list all users
- `PATCH /users/:id/status` – change user status (active/suspended)

#### Clinic (`/api/v1/clinics`) – `CLINIC_ADMIN` only

- `GET /me` – get clinic profile for current clinic admin
- `PUT /me` – create/update clinic profile
- `POST /doctors` – add doctor to clinic (body: `doctorUserId`)
- `DELETE /doctors/:doctorUserId` – remove doctor from clinic

#### Doctor (`/api/v1/doctors`) – `DOCTOR` only

- `GET /me` – get doctor profile
- `PUT /me` – create/update doctor profile
- `PUT /availability` – set availability (days & time slots)
- `GET /appointments` – view own appointments (optional `?status=APPROVED`)
- `PATCH /appointments/:appointmentId/status` – accept/reject/update appointment status
- `PUT /appointments/:appointmentId/report` – create/update medical report
- `GET /patients/:patientId/history` – view patient history (appointments + reports with this doctor); requires appointment or patient-granted access
- `GET /appointments/:appointmentId/payment` – view payment status for an appointment

#### Patient (`/api/v1/patients`)

- **PATIENT**: `GET /me`, `PUT /me`, `POST /appointments`, `GET /appointments`, `PATCH /appointments/:appointmentId/cancel`, `PATCH /appointments/:appointmentId/reschedule`, `GET /reports`, `GET /reports/appointment/:appointmentId`, `GET /payments`, `POST /access/grant`, `DELETE /access/revoke`
- **DOCTOR / CLINIC_ADMIN** (permission-based): `GET /:id/history` – centralized patient timeline (appointments + reports)

#### System (`/api/v1/system`) – `SUPER_ADMIN` only

- `GET /health` – application health (MongoDB, Redis)
- `GET /logs` – request/error logs (optional `?type=request|error`, `?limit`, `?skip`)
- `GET /errors` – error logs only
- `GET /backup/status` – backup status (mock)
- `POST /backup/run` – trigger backup (mock)

#### Notifications (`/api/v1/notifications`) – `PATIENT`, `DOCTOR`, `CLINIC_ADMIN`

- `GET /` – list my notifications (optional `?unread=true`, `?limit`, `?skip`)
- `PATCH /:id/read` – mark as read

#### Analytics (`/api/v1/analytics`)

- `GET /admin/overview` – `SUPER_ADMIN`: appointment counts by status, clinic/doctor/patient stats
- `GET /clinic/overview` – `CLINIC_ADMIN`: clinic-level stats
- `GET /doctor/overview` – `DOCTOR`: doctor-level stats

#### Chat (`/api/v1/chat`) – authenticated doctor or patient on given appointment

- `GET /appointments/:appointmentId/messages` – list messages in appointment conversation
- `POST /appointments/:appointmentId/messages` – send message

---

### Standard API Response Format

Every endpoint responds with:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { "any": "payload" }
}
```

Errors:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [],
  "stack": "only in non-production"
}
```

---

### Sample Postman Flows

#### 1. Patient Registration & Login

**Request** – `POST /api/v1/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response 201**

```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "user": {
      "id": "665f...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "PATIENT"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

Use `accessToken` as:

`Authorization: Bearer <accessToken>`

#### 2. Book Appointment (Patient)

**Request** – `POST /api/v1/patients/appointments`

```json
{
  "doctorId": "6660docid",
  "clinicId": "6660clinicid",
  "scheduledAt": "2026-02-01T09:00:00.000Z",
  "reason": "Regular checkup",
  "fee": 100
}
```

**Response 201**

```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "_id": "6660apptid",
    "patient": "665f...",
    "doctor": "6660docid",
    "clinic": "6660clinicid",
    "scheduledAt": "2026-02-01T09:00:00.000Z",
    "status": "PENDING",
    "fee": 100
  }
}
```

#### 3. Doctor Accepts Appointment

**Request** – `PATCH /api/v1/doctors/appointments/:appointmentId/status`

```json
{
  "status": "APPROVED"
}
```

#### 4. Create Medical Report (Doctor)

**Request** – `PUT /api/v1/doctors/appointments/:appointmentId/report`

```json
{
  "diagnosis": "Mild flu",
  "prescriptions": [
    { "name": "Paracetamol", "dosage": "500mg", "frequency": "3 times/day", "duration": "5 days" }
  ],
  "notes": "Rest and hydrate"
}
```

#### 5. Patient Views Report

**Request** – `GET /api/v1/patients/reports/appointment/:appointmentId`

---

### Socket.io Chat Usage

- Server Socket.io namespace: default (`/`)
- Connect from client:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: {
    token: "ACCESS_TOKEN_HERE"
  }
});

socket.emit("joinAppointment", "APPOINTMENT_ID");

socket.on("chatMessage", (msg) => {
  console.log("New message", msg);
});

// Send message
socket.emit("chatMessage", {
  appointmentId: "APPOINTMENT_ID",
  content: "Hello doctor!"
});
```

---

### Cron Jobs (node-cron)

Scheduled hourly:

- **Follow-up reminders** – reports with `followUpDate` today/tomorrow → notify patient
- **Appointment reminders** – upcoming appointments within 24h → notify patient and doctor
- **Missed appointment alerts** – past `scheduledAt`, status PENDING/APPROVED → notify patient and doctor

Jobs are idempotent (at most one notification per entity per type per day).

### Backend Freeze

The backend is **feature-complete** for FYP. See `docs/BACKEND_FREEZE_CHECKLIST.md` for the freeze readiness checklist. All new features are additive; existing APIs are unchanged.

### Notes for Academic Evaluation

- **Clean modular architecture**: feature-based modules (`auth`, `admin`, `clinic`, `doctor`, `patient`, `chat`, `system`, `notifications`, `analytics`) with separate controllers, services, models, and routes.
- **Security**: JWT auth, basic rate limiting, Helmet, CORS, password hashing (bcrypt), Redis-backed refresh tokens, patient consent model (grant/revoke doctor access).
- **Extensibility**: You can easily extend modules (analytics, billing gateways, notifications) without touching core auth or routing.
- **Testability**: Every endpoint uses JSON, consistent response shapes, and is directly invokable via Postman/Insomnia.

