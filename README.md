# Examify

Examify is a production-oriented first version of a Mathematics learning platform for South African students using the 70-20-10 model. This repository contains a Vite/React frontend, Tailwind UI system, Firebase integration layer, Firebase Cloud Functions for Paystack billing, Firebase AI Logic-backed Gemini recommendations, and setup documentation aligned with the current app structure.

## What is included

- Responsive landing page and marketing layout for the Maths-only tutoring proposition.
- Role-based authentication flows for students, tutors, and admins.
- Protected route groups for student, tutor, and admin workspaces.
- Student dashboard, billing, profile, exercises, peer review, and past-paper access.
- Tutor dashboard for assigning unassigned students, saving the latest tutor report, completing lessons, and triggering weekly exercise generation.
- Admin dashboard surfaces for payments, tutors, settings, users, and shared paper management.
- Daily exercise logic enforcing today-only completion and locked missed exercises.
- Image submission upload flow using Firebase Storage with Firestore submission records.
- Peer review flow with marks and comments.
- Firebase callable functions for secure Paystack initialization, verification, and recurring authorization charging.
- Firebase AI Logic integration for Gemini exercise recommendations from the frontend Firebase app.
- Demo-mode data so the app runs before Firebase credentials are available.

## Tech stack

- React 19 + Vite
- Tailwind CSS
- React Router
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions
- Firebase AI Logic (Gemini)
- Paystack

## Current route map

### Public routes

- `/`
- `/login`
- `/signup`

### Student routes

- `/student`
- `/student/exercises`
- `/student/peer-reviews`
- `/student/billing`
- `/student/profile`
- `/student/papers`

### Tutor routes

- `/tutor`
- `/tutor/students`
- `/tutor/reports`
- `/tutor/papers`

### Admin routes

- `/admin`
- `/admin/users`
- `/admin/payments`
- `/admin/settings`
- `/admin/papers`

## Project structure

```text
src/
  components/
  data/
  firebase/
  hooks/
  layouts/
  lib/
  pages/
  routes/
  services/
  utils/
functions/
  src/
docs/
```

## Local setup

### 1. Install dependencies

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Configure environment variables

Copy the example files and add your real values:

```bash
cp .env.example .env
cp functions/.env.example functions/.env
```

Frontend variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIRESTORE_DATABASE_ID` (use `(default)` or your named database such as `tutoring`)
- `VITE_FIREBASE_AI_MODEL` (for example `gemini-2.5-flash`)

Functions variables:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_BASE_URL`
- `PAYSTACK_CALLBACK_URL`
- `FIRESTORE_DATABASE_ID` (use `(default)` or your named database such as `tutoring`)

### 3. Run the app

```bash
npm run dev
```

### 4. Optional: run Firebase Functions locally

```bash
npm run functions:serve
```

## Demo accounts

When Firebase is not configured, the app automatically runs in demo mode. Use these accounts on the login page:

- `student@example.com`
- `tutor@example.com`
- `admin@example.com`

Any password is accepted in demo mode.

## Payment and generation flow

1. A student signs up and provides the previous year's mark.
2. Pricing is calculated in Cloud Functions from the student's latest mark and selected session type.
3. Paystack transaction initialization stores an `initialized` payment record in Firestore.
4. Paystack verification updates the payment record, stores a reusable authorization when available, and activates the student's subscription record on successful payment.
5. Exercise generation is considered ready only when the required payment, tutor context, and matching question-paper data exist.
6. Initial generation requires all of the following:
   - previous-year mark entered,
   - latest tutor report present,
   - at least one matching Maths paper for the student's grade and region,
   - active payment/subscription.
7. Weekly generation requires all of the following:
   - at least one completed lesson/topic,
   - at least one matching Maths paper,
   - active payment/subscription.
8. Generated assignments are written to `dailyExerciseAssignments` only if the student does not already have an assignment for that date.

## Where to get the credentials

- `PAYSTACK_SECRET_KEY`: In Paystack Dashboard → **Settings** → **API Keys & Webhooks**. Test keys start with `sk_test_`; live keys start with `sk_live_`.
- `PAYSTACK_BASE_URL`: Keep this as `https://api.paystack.co` unless Paystack specifically instructs you to change it.
- `PAYSTACK_CALLBACK_URL`: Use the frontend URL Paystack should send the user back to after payment, for example `http://localhost:5173/student/billing` in local development or your production domain route later.
- `VITE_FIREBASE_AI_MODEL`: Set the Firebase AI Logic Gemini model used by the web app, for example `gemini-2.5-flash`.
- `VITE_FIRESTORE_DATABASE_ID` / `FIRESTORE_DATABASE_ID`: Set these to `(default)` for the default Firestore database, or to your named database such as `tutoring`.

## Production notes

- Paystack secret keys are only used in Firebase Cloud Functions.
- Paystack verification persists payment metadata, stored authorization details, and subscription status in Firestore.
- Gemini recommendations are generated through Firebase AI Logic in the frontend Firebase initialization layer instead of the older direct Gemini Developer API function path.
- Storage uploads create submission documents in Firestore after a successful upload.
- Tutor assignment logic blocks a second active Maths tutor for the same student.
- Tutor lesson completion records topic, topic report, understanding level, and completion date in Firestore.
- The current app includes realistic structure for future extensions such as analytics, scheduling, automated recurring renewals, and richer orchestration around AI recommendations.

## Firestore entities modeled

- `users`
- `students`
- `tutors`
- `tutorStudentAssignments`
- `studentProfiles`
- `studentPerformance`
- `coveredTopics`
- `lessons`
- `exercises`
- `dailyExerciseAssignments`
- `submissions`
- `peerReviews`
- `tutorReports`
- `questionPapers`
- `subscriptions`
- `subscriptionAuthorizations`
- `payments`
- `notifications`
- `settings`

## Next recommended steps

1. Connect a real Firebase project and set Firestore security rules.
2. Deploy Cloud Functions and configure Paystack callback URLs.
3. Replace the remaining placeholder live-data dashboard sections with full Firestore-backed queries for each role workspace.
4. Add scheduled functions for recurring renewals and richer AI exercise orchestration.
5. Add end-to-end tests once deployment credentials and emulator workflows are available.
