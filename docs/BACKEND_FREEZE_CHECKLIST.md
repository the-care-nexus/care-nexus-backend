# Backend Freeze Readiness Checklist

**The Care Nexus** – Backend feature-complete for FYP. Use this checklist to validate freeze readiness.

---

## 1. API Consistency

- [] All REST APIs under `/api/v1`
- [] Standard response format: `{ success, message, data }` (errors: `{ success: false, message, errors?, stack? }`)
- [] JSON payloads; `Content-Type: application/json` where applicable
- [] No breaking changes to existing endpoints (auth, admin, clinic, doctor, patient, chat)

---

## 2. RBAC Coverage

| Role         | Modules / Endpoints                                                                 |
| ------------ | ----------------------------------------------------------------------------------- |
| SUPER_ADMIN  | Admin, System (health, logs, errors, backup), Analytics admin overview              |
| CLINIC_ADMIN | Clinic, Notifications, Analytics clinic overview, GET /patients/:id/history (scope) |
| DOCTOR       | Doctor, Notifications, Analytics doctor overview, GET /patients/:id/history (scope) |
| PATIENT      | Patient, Notifications, access grant/revoke                                         |

- [] JWT `authenticate` + `authorizeRoles` applied on all protected routes
- [] Permission-aware access: doctor/clinic admin patient history only when allowed (appointment or consent)

---

## 3. New Modules (Additive Only)

- [] **System** – Health, logs, errors, backup (mock). Admin-only.
- [] **Notifications** – List, mark read. Auto-create on appointment events. Patient, Doctor, Clinic Admin.
- [] **Cron jobs** – Follow-up reminders, appointment reminders, missed alerts. Idempotent, safe.
- [] **Access control** – Patient consent (grant/revoke). Doctor access = appointment OR consent.
- [] **Patient history** – GET /patients/:id/history, centralized timeline, permission-based.
- [] **Analytics** – Admin / clinic / doctor overview. Aggregation-only, no dashboards.

---

## 4. No Breaking Changes

- [] Existing auth, admin, clinic, doctor, patient, chat behaviour unchanged
- [] No removals or signature changes of existing APIs
- [] New models (Notification, PatientAccess, SystemLog) and optional fields (e.g. `followUpDate` on reports) only

---

## 5. Testability (Postman / Insomnia)

- [] All new endpoints documented and callable via Postman/Insomnia
- [] Collection variables: `baseUrl`, `accessToken`, `refreshToken`, `appointmentId`, `clinicId`, `doctorId`

---

## 6. Feature Complete for FYP

- [] Backend suitable for academic evaluation and real-world extension
- [] Ready to start frontend development
- [] Marked **feature complete** for backend freeze

---

## Sign-off

- **Checklist date:** 2026-03-20
- **Backend status:** Feature complete, freeze-ready.
