# Micro-LMS — Agent Task List

Source brief: `Micro-LMS-Assignment.md`. Read it first. Work phases in order; each phase ends with a
commit (the repo history is graded — small, descriptive commits, never one giant commit).
Tick boxes `[x]` as you finish. Do not start Phase N+1 until Phase N's "Done when" passes.

## Ground rules for agents
- Stack is fixed: Node.js + Express + MongoDB (Mongoose) backend, React (Vite) + Tailwind frontend.
- Plain JavaScript, ES modules (`"type": "module"`). Keep code small and explainable — the author must defend every line.
- **Every rule in brief §4 is enforced on the server.** UI hiding is a bonus, never the enforcement.
- Never store a progress percentage. Store completed lesson IDs; compute % on read (see Phase 3).
- Consistent error shape: `{ error: "message" }` with correct status (400/401/403/404/409).
- **Out of scope for now:** automated tests and all optional features from the brief. Do NOT add them —
  they will be scheduled after the core is complete. Verify each phase manually (curl / browser).
- Don't add anything outside the brief's core requirements.

## Target structure
```
micro-lms/ (repo root = this folder)
├─ package.json            # root scripts: dev, seed (delegate to server/client)
├─ README.md
├─ server/
│  ├─ package.json
│  ├─ .env.example         # MONGO_URI, JWT_SECRET, PORT, CLIENT_ORIGIN
│  └─ src/
│     ├─ app.js            # builds express app (exported separately from listen)
│     ├─ index.js          # connects mongo + listen
│     ├─ config.js
│     ├─ models/ User.js Course.js Lesson.js Enrollment.js
│     ├─ middleware/ auth.js (requireAuth, optionalAuth, requireRole) errorHandler.js
│     ├─ services/ progress.js     # the ONLY place % is computed
│     ├─ routes/ auth.js courses.js lessons.js enrollments.js instructor.js
│     └─ seed.js
└─ client/ (Vite React app)
```

---

## Phase 0 — Scaffold (commit: "chore: scaffold server and client")
- [x] `git init`, add `.gitignore` (node_modules, .env, dist).
- [x] `server/`: npm init; deps `express mongoose bcryptjs jsonwebtoken cors dotenv`; dev dep `nodemon`.
- [x] `server/src/app.js` exports `createApp()`; `index.js` connects via `MONGO_URI` and listens on `PORT`. `GET /api/health` → `{ok:true}`.
- [x] `client/`: `npm create vite@latest client -- --template react`, add Tailwind, `react-router-dom`. Vite proxy `/api` → `http://localhost:5000`.
- [x] Root `package.json` scripts: `dev` (concurrently server+client), `seed` (`npm --prefix server run seed`).
- [x] `server/.env.example` with all vars documented.

**Done when:** `npm run dev` serves the Vite page and `/api/health` responds.

## Phase 1 — Models + Auth (commit: "feat: user model and JWT auth")
- [x] Models (Mongoose, timestamps on):
  - `User { name, email (unique, lowercase), passwordHash, role: enum['instructor','student'] }` — `toJSON` strips passwordHash.
  - `Course { title, description, category, status: enum['draft','published'] default 'draft', instructor: ObjectId→User }`
  - `Lesson { course: ObjectId→Course, title, contentType: enum['text','video'], body (text or URL), durationMinutes (int ≥1), order (int) }` index `{course:1, order:1}`.
  - `Enrollment { student→User, course→Course, completedLessons: [ObjectId→Lesson] }` **unique index `{student:1, course:1}`**. Call `Enrollment.syncIndexes()` on startup so the unique index exists.
- [x] `POST /api/auth/signup {name,email,password,role}` → validate (role one of two, password ≥6), bcrypt hash, return `{token, user}`. Duplicate email → 409.
- [x] `POST /api/auth/login` → `{token, user}`; bad creds → 401 (same message for unknown email / wrong password).
- [x] `GET /api/auth/me`.
- [x] `middleware/auth.js`: `requireAuth` (Bearer JWT → `req.user = {id, role}`), `optionalAuth`, `requireRole(...roles)` → 403.
- [x] Central `errorHandler`: ValidationError → 400, CastError (bad ObjectId) → 404, duplicate key 11000 → 409.

**Done when:** signup/login/me work via curl; wrong role → 403.

## Phase 2 — Courses & Lessons (instructor) (commit per bullet group)
Ownership helper: `loadOwnedCourse(req)` → 404 if missing, 403 if `course.instructor != req.user.id`. Use it in EVERY instructor mutation.
- [ ] `POST /api/courses` (instructor) — create, status defaults `draft`.
- [ ] `PATCH /api/courses/:id` (owner) — title/description/category/status.
- [ ] `POST /api/courses/:id/lessons` (owner) — `order = (max existing order) + 1`.
- [ ] `PATCH /api/courses/:id/lessons/:lessonId` (owner) — edit fields (not order); lesson must belong to that course.
- [ ] `DELETE /api/courses/:id/lessons/:lessonId` (owner) — then renumber remaining orders 1..n. (Progress stays correct because % is computed against current lessons.)
- [ ] `PUT /api/courses/:id/lessons/reorder {lessonIds:[...]}` (owner) — 400 unless the array is exactly the set of this course's lesson IDs (same length, no dupes, no foreign IDs); then `bulkWrite` order = index+1.

**Done when:** via curl, a non-owner instructor gets 403 on every route above; reorder rejects partial/foreign lists.

## Phase 3 — Catalogue, Enrollment, Progress (the core rules) (commit: "feat: enrollment and progress")
- [ ] `services/progress.js`:
  - `computeProgress(enrollment, lessonIdsInOrder)` → `{ completedCount, totalLessons, percent, nextLessonId }` where `completedCount = |completedLessons ∩ current lessons|`, `percent = total ? round(completed/total*100) : 0`, `nextLessonId` = first lesson in order not completed (null if done). **Single source of truth — used by student and instructor endpoints.**
- [ ] `GET /api/courses` — **published only**; each item: title, description, category, instructor name, `lessonCount`, `totalDuration` (aggregate on Lesson). If requester is a student, include `enrolled: bool`.
- [ ] `GET /api/courses/:id` — published → summary + lesson titles/durations/order (no bodies). Draft → 404 unless requester is the owner.
- [ ] `POST /api/courses/:id/enroll` (student) — course must be published (else 404). Duplicate → **409** (rely on the unique index catching 11000 — handles races — not just a pre-check).
- [ ] `GET /api/courses/:id/lessons/:lessonId` — returns body. Allowed if owner instructor OR enrolled student; non-enrolled student → **403**; draft course for student → 404; lesson not in that course → 404.
- [ ] `POST /api/courses/:id/lessons/:lessonId/complete` (enrolled student) — verify lesson belongs to course; `$addToSet` lessonId; return fresh progress. Idempotent.
- [ ] `GET /api/me/enrollments` (student) — each enrolled course with `percent`, `completedCount`, `totalLessons`, `nextLessonId` (Resume target). Decide + document behaviour for courses unpublished after enrollment.

**Done when:** a manual curl walkthrough shows every rule in brief §4 holding:
enroll twice → 409; non-enrolled lesson read → 403; draft invisible (list + GET + enroll → 404);
non-owner edit → 403; double-complete → % unchanged; add lesson to in-progress course → % recalculates correctly.

## Phase 4 — Instructor dashboard endpoints (commit: "feat: instructor dashboard API")
- [ ] `GET /api/instructor/courses` — owner's courses (draft+published) with `studentCount` and `avgCompletion` (mean of each enrollment's computed percent; 0 if no students). Use `computeProgress`; batch queries (one Lesson query, one Enrollment query — avoid N+1 per student).
- [ ] `GET /api/instructor/courses/:id/students` (owner only, 403 otherwise) — list `{student name/email, completedCount, totalLessons, percent, enrolledAt}`.

**Done when:** numbers match a hand calculation against seeded/curl-created data.

## Phase 5 — Frontend (commit per page)
Minimal, clean Tailwind. `api.js` fetch wrapper adds Bearer token, surfaces `{error}`. `AuthContext` stores token+user in localStorage. Route guards by role (UX only).
- [ ] Login / Signup (role picker).
- [ ] Student: **Catalogue** (cards: title, instructor, lessons, total minutes, Enroll / Open button) → **Course page** (ordered lesson list with ✓ marks, progress bar) → **Lesson page** (text body or video link/iframe, "Mark complete", Next/Prev). Lessons after the first incomplete one shown locked in UI.
- [ ] Student: **My Learning** — enrolled courses, % bar, **Resume** → `nextLessonId` (or "Completed").
- [ ] Instructor: **Dashboard** table (title, status badge, students, avg completion) + "New course".
- [ ] Instructor: **Course editor** — edit fields, publish/unpublish toggle, add lesson form, edit/delete lesson, reorder via ↑/↓ buttons calling the reorder endpoint with the full array.
- [ ] Instructor: **Students view** — table of enrolled students with progress.
- [ ] Show server error messages (e.g. 409 "Already enrolled") in UI.

**Done when:** full manual flow works against seeded data in both roles.

## Phase 6 — Seed + README (commits: "chore: seed script", "docs: README")
- [ ] `server/src/seed.js` (`npm run seed`): wipe collections; create **2 instructors, 5 students, 3 courses** (e.g. 2 published + 1 draft, or 3 published + an extra draft), 3–6 lessons each with mixed text/video, **partial enrollments** at varied % (incl. 0% and 100%). All passwords `password123`; print a login table at the end.
- [ ] `README.md`:
  - Setup (Node ≥18, Mongo local or Atlas, `.env` vars, `npm install` in root/server/client, `npm run seed`, `npm run dev`) — target <5 minutes.
  - Data model sketch (4 collections, fields, relations, indexes) — mermaid ER diagram ok.
  - **Decisions & trade-offs**: (1) progress as completed-ID set computed on read (always correct when lessons change; cost = computation per request); (2) integer order + full-array reorder (simple, validated; cost = rewrites n docs per reorder); (3) 404 for drafts vs 403 for ownership; sequential order enforced in UI only.
  - Assumptions made (unpublished-after-enrollment behaviour, sequential access, etc.).
  - What I'd do with two more days.
  - **What's broken or unfinished** — honest list (note tests + optional feature pending until added).
  - **Tricky part walkthrough**: progress staying correct when lessons are added/removed + idempotent completion.

**Done when:** fresh clone → README steps → running app + seeded data in under 5 minutes.

## Final checklist (core)
- [ ] Every §4 rule has a server-side check (verified manually).
- [ ] No progress % stored anywhere in DB.
- [ ] `.env` not committed; `.env.example` is.
- [ ] Git history shows incremental commits per phase.

## Deferred — do NOT start until core is complete and the owner says go
- Automated tests (brief requires ≥3 rule tests — will be added later).
- One optional feature from the brief (TBD).
