# Examify architecture

## Frontend
- React + Vite + Tailwind CSS.
- React Router controls a public marketing/auth area plus protected route groups for students, tutors, and admins.
- Student workspace currently includes dashboard, exercises, peer reviews, billing, profile, and past papers.
- Tutor workspace currently includes dashboard, students, reports, and shared past-paper management.
- Admin workspace currently includes dashboard, users, payments, settings, and shared past-paper management.
- Firebase client SDK handles authentication, Firestore, Storage, callable functions, and Firebase AI Logic access.
- Demo-mode fallbacks keep the app runnable before credentials are configured.

## Backend
- Firebase Cloud Functions provide secure Paystack transaction initialization, verification, and stored-authorization charging.
- Paystack pricing is calculated in functions from latest mark and session type before redirecting students to checkout.
- Paystack verification writes payment records, stores reusable authorization details, and updates subscription documents.
- Firestore stores users, tutor assignments, completed topics, question papers, subscriptions, payments, submissions, tutor reports, peer reviews, and daily exercise assignments.
- Firebase Storage stores uploaded answer images and question-paper files.
- Firebase AI Logic provides Gemini-powered recommendation generation from the web app through the shared Firebase client configuration.

## Key business rules implemented
- Maths-only positioning is reflected across landing copy, tutor workflows, assignment records, and payment metadata.
- Students can access only today's exercise for completion; missed work is locked and upcoming work is unavailable.
- Students pay before exercise generation can fully unlock.
- Tutors manage student assignment, latest free-text reports, covered topics, and understanding levels.
- A tutor-to-student assignment check prevents more than one active Maths tutor relationship.
- Initial exercise generation requires previous-year mark, latest tutor report, matching paper availability, and active payment.
- Weekly exercise generation requires a completed lesson/topic, matching paper availability, and active payment.
- Generated assignments are skipped for dates that already have a stored daily assignment.
- Gemini recommendations are architected to use grade, region, completed topics, tutor reports, past marks, understanding level, and question-paper metadata.

## Persistence model highlights
- `payments` captures initialized, verified, and recurring charge records.
- `subscriptionAuthorizations` stores reusable Paystack authorization data per student when available.
- `subscriptions` tracks active or pending student billing state.
- `coveredTopics` stores tutor-completed lesson/topic data with understanding level and topic report.
- `dailyExerciseAssignments` stores generated student work keyed by student and assignment date.
- `submissions` stores uploaded answer-image metadata after Firebase Storage upload succeeds.
