import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CourseCover } from "@/components/course-cover"
import { LogoMark } from "@/components/site-header"
import { ProgressBar } from "@/components/progress-bar"
import { requireUser } from "@/lib/auth"
import { listMyCourses, type MyCourse } from "@/lib/data"

export const metadata: Metadata = { title: "My Learning" }

type Params = { tab: "in-progress" | "completed"; notice: string }

export default function MyLearningPage({ searchParams }: PageProps<"/my-learning">) {
  const params = searchParams.then(
    (p): Params => ({
      tab: p.tab === "completed" ? "completed" : "in-progress",
      notice: typeof p.notice === "string" ? p.notice : "",
    }),
  )
  return (
    <>
      <div className="border-b border-line bg-soft">
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <h1 className="h-display !text-[clamp(1.9rem,1.4rem+2vw,2.6rem)]">My Learning</h1>
          <Suspense fallback={<div className="h-14" />}>
            <Tabs params={params} />
          </Suspense>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <Suspense fallback={<Skeleton />}>
          <Dashboard params={params} />
        </Suspense>
      </div>
    </>
  )
}

async function Tabs({ params }: { params: Promise<Params> }) {
  const { tab } = await params
  return (
    <nav aria-label="My Learning" className="mt-6 flex gap-8">
      {(
        [
          ["in-progress", "In Progress", "/my-learning"],
          ["completed", "Completed", "/my-learning?tab=completed"],
        ] as const
      ).map(([key, label, href]) => (
        <Link
          key={key}
          href={href}
          aria-current={tab === key ? "page" : undefined}
          className={`-mb-px border-b-[3px] pb-3 font-semibold ${tab === key ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="space-y-4">
      <div className="skeleton h-40" />
      <div className="skeleton h-40" />
    </div>
  )
}

async function Dashboard({ params }: { params: Promise<Params> }) {
  const user = await requireUser("/my-learning")
  const [courses, { tab, notice }] = await Promise.all([listMyCourses(user.id), params])
  const list = courses.filter((c) => (tab === "completed" ? c.status === "completed" : c.status === "active"))

  return (
    <>
      {notice === "password-updated" && (
        <p role="status" className="mb-6 rounded-lg border border-success/30 bg-success-50 px-4 py-3 font-semibold text-success">
          Your password was updated.
        </p>
      )}
      {list.length ? (
        <ul className="space-y-4">
          {list.map((c) => (
            <MyCourseRow key={c.enrollmentId} item={c} />
          ))}
        </ul>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-xl font-semibold">
            {tab === "completed" ? "You haven't completed a course yet" : "You don't have any courses in progress"}
          </p>
          <p className="mx-auto mt-2 max-w-[46ch] text-muted">
            {tab === "completed"
              ? "Finish every item in a course and it will appear here."
              : "Find a course you're interested in and enroll for free. Your progress will show up here."}
          </p>
          <Link href="/courses" className="btn btn-primary mt-6">
            Explore courses
          </Link>
        </div>
      )}
    </>
  )
}

function MyCourseRow({ item }: { item: MyCourse }) {
  const { course } = item
  const isDone = item.status === "completed"
  const pct = item.total ? Math.round((item.done / item.total) * 100) : 0
  return (
    <li className="card grid items-center gap-5 p-4 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:p-5">
      <Link href={`/courses/${course.slug}`} className="block aspect-[16/9] overflow-hidden rounded-md" tabIndex={-1} aria-hidden="true">
        <CourseCover motif={course.coverMotif} tone={course.coverTone} seed={course.slug} rounded={false} />
      </Link>
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-sm text-muted">
          <LogoMark className="h-5 w-5" />
          {course.instructorName}
        </p>
        <h2 className="mt-1 text-lg font-semibold leading-snug">
          <Link href={`/courses/${course.slug}`} className="hover:underline">
            {course.title}
          </Link>
        </h2>
        {isDone ? (
          <p className="mt-1 text-sm font-semibold text-success">
            Completed
            {item.completedAt &&
              ` on ${new Date(item.completedAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        ) : (
          item.lastLessonTitle && <p className="mt-1 truncate text-sm text-muted">Last item: {item.lastLessonTitle}</p>
        )}
        <div className="mt-3 flex max-w-md items-center gap-3">
          <ProgressBar className="flex-1" done={item.done} total={item.total} label={`${course.title} progress`} />
          <span className="text-sm text-muted">{pct}% complete</span>
        </div>
      </div>
      {isDone ? (
        <div className="flex flex-wrap gap-2 sm:flex-col">
          <Link href="/certificates" className="btn btn-primary">
            View certificate
          </Link>
          <Link href={item.resumeHref} className="btn btn-outline">
            Review
          </Link>
        </div>
      ) : (
        <Link href={item.resumeHref} className="btn btn-primary">
          {item.done ? "Resume" : "Start"}
        </Link>
      )}
    </li>
  )
}
