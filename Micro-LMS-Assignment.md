# Internship Take-Home: Micro-LMS

**Time budget:** 1–2 days (please don't spend more — we'd rather see a small, finished, well-reasoned build than a large half-working one)
**Stack:** Node.js + Express + MongoDB on the backend, React on the frontend
**Submit by:** [date]

---

## The brief

Build a **Micro-LMS** — a stripped-down learning platform where instructors publish courses and students work through them while their progress is tracked.

This is a real slice of what we do, so the interesting part isn't the CRUD. It's the rules: who can see what, what happens when a student is halfway through a course, and what happens when the data isn't clean.

---

## Core requirements

### 1. Accounts and roles

- Two roles: **instructor** and **student**
- Signup, login, JWT-based sessions
- A user's role determines what they can see and do

### 2. Instructor side

- Create a course: title, description, category, and a **draft / published** state
- Add lessons to a course. A lesson has a title, a content body (plain text or a video URL — your choice), a duration in minutes, and an **order** within the course
- Reorder lessons after creating them
- A dashboard listing their courses with: number of students enrolled, and average completion % across those students
- Drill into one course to see each enrolled student and how far along they are

### 3. Student side

- Browse published courses (title, instructor, lesson count, total duration)
- Enroll in a course
- Open a course and work through lessons in order
- Mark a lesson complete
- See their own progress: % complete per enrolled course, and a **"Resume"** action that takes them to the first incomplete lesson

### 4. Rules that must actually hold

These are the requirements we'll test hardest. Enforce them **on the server**, not just by hiding buttons:

- A student cannot enroll in the same course twice
- A student cannot read lessons of a course they haven't enrolled in
- Draft courses are invisible to students entirely
- Only the instructor who owns a course can edit it, add lessons to it, or see its student list
- Marking a lesson complete twice doesn't inflate the progress number
- If an instructor adds a new lesson to a course students are already taking, existing progress percentages must stay correct

---

## What we're not asking for

Skip these — they don't earn points:

- Video hosting or upload (a URL string is fine)
- Payments
- Email
- Polished visual design. Clean and usable beats pretty; Tailwind defaults are perfectly fine.

---

## Optional — pick at most one

Only if you have time left after the core is solid and tested:

- A short quiz at the end of a lesson, with a stored score
- Certificate generation at 100% completion
- CSV export of a course's student progress
- Search and category filtering on the course catalogue

---

## Deliverables

1. **A GitHub repo** (public, or private with access shared). Commit as you go — we'd like to see the history, not one giant "initial commit".
2. **A seed script** (`npm run seed`) that creates 2 instructors, 5 students, 3 courses with lessons, and some partial enrollments. We need to be able to run your project in under five minutes.
3. **A README** containing:
   - Setup steps and required env vars
   - Your data model, sketched out — collections, key fields, and how they relate
   - **Decisions and trade-offs:** two or three choices you made and what you gave up by making them. For example: where progress is stored and why, how you handled lesson ordering.
   - **What you'd do with two more days**
   - **What's broken or unfinished** — say so plainly. Listing your own gaps scores better than hoping we miss them.
4. **At least three meaningful tests.** Not "it returns 200" — test the rules above. For example: a non-enrolled student is refused lesson access; double-completing a lesson doesn't change progress.
5. **A short walkthrough** — either 5 minutes of screen recording, or a section in the README — explaining one part of your code you found genuinely tricky and how you worked it out.

A deployed link is nice but entirely optional.

---

## On using AI tools

Use them. We do. But you own every line you submit, and the walkthrough and follow-up conversation will be about **your** code — we'll ask why it's structured the way it is, and what happens if we change an input. Code you can't explain is worse than code you didn't write.

---

## Questions

If something here is ambiguous, you have two valid options: email us and ask, or make a call, write your assumption down in the README, and move on. Both are fine. Being blocked for a day is not.
