# Veyro

A Coursera-style learning platform: structured courses made of modules and lessons (video and reading),
free enrollment, server-verified progress tracking, and resume-where-you-left-off.

This is **phase 1** of the project plan: foundation + the complete student journey.

| | |
| --- | --- |
| App | Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS 4 |
| Database & auth | Supabase (Postgres + Auth), project `veyro` in region `ap-south-1` (Mumbai) |
| Video | Official YouTube IFrame Player API (privacy-enhanced `youtube-nocookie.com`) |

## Run it locally

Requires **Node.js 20.9 or newer**.

```bash
copy .env.example .env.local     # Windows (macOS/Linux: cp .env.example .env.local)
npm install
npm run dev
```

Open http://localhost:3000. `.env.example` already holds the `veyro` Supabase project's URL and
publishable key. Sign up with a real email address — Supabase sends a
confirmation link, which you open in the same browser.

Other scripts:

```bash
npm run build      # production build (also type-checks)
npm run lint
npm test           # unit tests (playback interval tracker)
npm run typecheck
```

## What's built

- **Accounts:** sign up with email confirmation, sign in, sign out, forgot/reset password, profile name.
- **Catalog:** home page with search and subjects, course list with full-text search and subject/level filters.
- **Course page:** outcomes, curriculum (modules → lessons, lengths, preview lessons), one-click free enrollment.
- **Classroom:** curriculum sidebar with completion marks, YouTube video lessons, reading lessons (Markdown),
  previous/next navigation, course progress bar, preview mode for non-enrolled visitors.
- **Progress:** video lessons complete at 85% watched (skipped sections don't count); reading lessons on
  "Mark as read". Playback position is saved, so videos resume where you stopped. A course is marked
  complete when every required lesson is done.
- **My learning:** in-progress and completed courses with progress and a Resume button.
- **Demo content:** 4 published courses (21 lessons) built around 3Blue1Brown's lectures plus original
  reading lessons. Videos are embedded, not copied, and credited on every lesson.

## How the rules are enforced

All business rules live in the database (`supabase/migrations/`), not the browser:

- **Row Level Security** on every table. Students can read only their own enrollments and progress.
  Lesson content (video IDs, article text) is readable only by enrolled learners, preview lessons,
  or the course owner/admin.
- **No direct writes.** Enrollment and progress go through four Postgres functions
  (`enroll_in_course`, `open_lesson`, `record_video_progress`, `complete_article_lesson`) that check
  the caller's enrollment.
- **Video progress** is sent as watched intervals every ~10 s. The server merges them (so repeats
  don't double-count), clamps them to the lesson length, and rejects implausible jumps (more coverage
  than 2× real elapsed time). Completion is decided server-side.
- **Roles:** a profile's `role` can't be changed by its owner (column-level privileges); new
  accounts are always students.

These rules were tested by simulating anonymous, enrolled and non-enrolled users directly in the
database (23 checks: access control, idempotency, replay/jump rejection, role escalation,
course completion).

## Project layout

```
src/
  app/
    page.tsx                     home
    courses/                     catalog + course details (+ enroll action)
    learn/[slug]/                resume redirect
    learn/[slug]/[lessonId]/     classroom (video player, mark-as-read)
    my-learning/                 dashboard
    (auth)/                      sign in / sign up / forgot password
    account/                     profile + change password
    auth/                        email-link callbacks, sign out
  components/                    header, course cover art, cards, curriculum, progress bar
  lib/
    data.ts                      all database reads
    auth.ts                      current user helpers
    playback-tracker.ts          turns playback samples into watched intervals
    supabase/                    server + browser clients
  proxy.ts                       session refresh, sign-in redirects
supabase/
  migrations/                    schema, RLS, functions
  seed.sql                       demo courses (safe to re-run)
```

## Supabase dashboard settings to check

1. **Authentication → URL Configuration:** Site URL `http://localhost:3000` for now. Add your
   production URL (and `https://your-domain/**` under Redirect URLs) when you deploy.
2. **Authentication → Providers → Email → Leaked password protection:** turn it on.
3. **Email sending:** the built-in mailer is heavily rate-limited (a few emails per hour). Set up custom
   SMTP (Resend, Postmark, SES…) before real users sign up.
4. *(Optional)* To let people confirm on a different device than the one they signed up on, change the
   email templates to use
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/my-learning`
   (the `/auth/confirm` route is already built).

### Make yourself an admin or instructor

In the Supabase SQL editor:

```sql
update public.profiles set role = 'instructor'   -- or 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

## Next phases (from the project plan)

1. **Instructor workflows** — create/edit courses, modules and lessons; drafts and publishing;
   ownership checks (the RLS helpers `can_manage_course` are already in place).
2. **Quizzes** — question types, server-side grading, attempts, passing rules (the `quiz` lesson
   type already exists).
3. **Certificates** — issue on completion, public verification page, revocation.
4. **Admin** — role management, moderation, audit log.
5. **Hardening** — monitoring, backups/restore test, accessibility pass, load test, deployment.
