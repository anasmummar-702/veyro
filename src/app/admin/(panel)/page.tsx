import type { Metadata } from "next"
import Link from "next/link"
import { connection } from "next/server"
import { Suspense } from "react"
import { getAdminOverview, listAdminStudents, requireAdmin } from "@/lib/admin"
import { plural } from "@/lib/format"
import { Bar, PageHeader, StatusBadge, initials, timeAgo } from "@/app/admin/_components/ui"

export const metadata: Metadata = { title: "Admin dashboard", robots: { index: false } }

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="How your courses and students are doing.">
        <Link href="/admin/courses/new" className="btn btn-primary">
          + New course
        </Link>
      </PageHeader>
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </Suspense>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-hidden="true" className="mt-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-28" />
        ))}
      </div>
      <div className="skeleton h-80" />
    </div>
  )
}

async function Dashboard() {
  await connection() // always live data ("2 h ago" labels)
  await requireAdmin("/admin")
  const [o, students] = await Promise.all([getAdminOverview(), listAdminStudents()])
  const learners = students.filter((s) => s.role === "student")

  const tiles = [
    { label: "Students", value: o.students, note: `+${o.new_students_7d} this week`, icon: "M7.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 17a5.5 5.5 0 0 1 11 0M13.5 4.2a3 3 0 0 1 0 5.6M15.5 12.4A5.5 5.5 0 0 1 18 17" },
    { label: "Active this week", value: o.active_learners_7d, note: "learners who studied", icon: "M3 13l4-4 3 3 7-7M13 5h4v4" },
    { label: "Enrollments", value: o.enrollments, note: `${o.in_progress} in progress · ${o.completed} completed`, icon: "M4 4.5h12v11H4zM4 8h12M8 4.5v11" },
    { label: "Certificates issued", value: o.certificates, note: `${o.lessons_completed} classes completed`, icon: "M10 12.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM7 11.5 6 17l4-2 4 2-1-5.5" },
  ]

  return (
    <div className="mt-8 space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-semibold text-muted">{t.label}</dt>
              <span className="icon-tile h-9 w-9">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
                  <path d={t.icon} />
                </svg>
              </span>
            </div>
            <dd>
              <span className="font-display mt-2 block text-[2.2rem] font-extrabold leading-none tracking-[-0.03em] text-navy">{t.value}</span>
              <span className="mt-2 block text-sm text-muted">{t.note}</span>
            </dd>
          </div>
        ))}
      </dl>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold tracking-[-0.01em]">Courses</h2>
          <Link href="/admin/courses" className="link text-sm">
            Manage courses
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[0.95rem]">
            <thead className="bg-soft text-xs font-bold uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Content</th>
                <th className="px-3 py-3 text-right">Students</th>
                <th className="px-3 py-3 text-right">Completed</th>
                <th className="px-3 py-3">Avg. progress</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {o.courses.map((c) => (
                <tr key={c.id} className="hover:bg-brand-50/40">
                  <td className="px-5 py-3.5 font-semibold">{c.title}</td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-3 py-3.5 text-sm text-muted">
                    {plural(c.modules, "module")} · {plural(c.sections, "section")} · {plural(c.videos, "video")}
                  </td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{c.enrolled}</td>
                  <td className="px-3 py-3.5 text-right tabular-nums">{c.completed}</td>
                  <td className="px-3 py-3.5">
                    <Bar pct={c.avg_progress} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/admin/courses/${c.id}`} className="link text-sm">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold tracking-[-0.01em]">Newest students</h2>
          <Link href="/admin/students" className="link text-sm">
            See all students
          </Link>
        </div>
        {learners.length ? (
          <ul className="divide-y divide-line">
            {learners.slice(0, 6).map((s) => {
              const done = s.courses.filter((c) => c.status === "completed").length
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-4 px-5 py-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7bff] to-[#0041a8] text-sm font-bold text-white">
                    {initials(s.fullName || s.email)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.fullName || "—"}</span>
                    <span className="block truncate text-sm text-muted">{s.email}</span>
                  </span>
                  <span className="text-sm text-muted">
                    {s.courses.length} {s.courses.length === 1 ? "course" : "courses"} · {done} completed
                  </span>
                  <span className="w-28 text-right text-sm text-muted">{timeAgo(s.lastActivityAt ?? s.joinedAt)}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-muted">No students yet. They&rsquo;ll appear here as soon as someone signs up.</p>
        )}
      </section>
    </div>
  )
}
