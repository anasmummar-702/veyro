import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CourseCover } from "@/components/course-cover"
import { getAdminOverview, requireAdmin } from "@/lib/admin"
import { plural } from "@/lib/format"
import { createClient } from "@/lib/supabase/server"
import { PageHeader, StatusBadge } from "@/app/admin/_components/ui"

export const metadata: Metadata = { title: "Courses", robots: { index: false } }

export default function AdminCoursesPage({ searchParams }: PageProps<"/admin/courses">) {
  return (
    <>
      <PageHeader title="Courses" subtitle="Create courses, then add modules and sections inside each one.">
        <Link href="/admin/courses/new" className="btn btn-primary">
          + New course
        </Link>
      </PageHeader>
      <Suspense fallback={<div className="skeleton mt-8 h-96" />}>
        <Courses notice={searchParams.then((p) => (p.deleted ? "Course deleted." : ""))} />
      </Suspense>
    </>
  )
}

async function Courses({ notice }: { notice: Promise<string> }) {
  await requireAdmin("/admin/courses")
  const supabase = await createClient()
  const [overview, { data: covers }, message] = await Promise.all([
    getAdminOverview(),
    supabase.from("courses").select("id, cover_motif, cover_tone"),
    notice,
  ])
  const coverById = new Map((covers ?? []).map((c) => [c.id, c]))

  return (
    <>
      {message && (
        <p role="status" className="mt-6 rounded-lg border border-success/30 bg-success-50 px-4 py-3 font-semibold text-success">
          {message}
        </p>
      )}
      {overview.courses.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="text-xl font-semibold">No courses yet</p>
          <Link href="/admin/courses/new" className="btn btn-primary mt-5">
            Create your first course
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {overview.courses.map((c) => {
            const cover = coverById.get(c.id)
            return (
              <li key={c.id} className="card card-hover group relative flex flex-col p-3">
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
                  <CourseCover motif={(cover?.cover_motif ?? "grid") as never} tone={(cover?.cover_tone ?? "lapis") as never} seed={c.slug} rounded={false} />
                  <span className="absolute left-2.5 top-2.5">
                    <StatusBadge status={c.status} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
                  <h2 className="font-bold leading-snug">
                    <Link href={`/admin/courses/${c.id}`} className="after:absolute after:inset-0 group-hover:text-brand">
                      {c.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {plural(c.modules, "module")} · {plural(c.sections, "section")} · {plural(c.videos, "video")}
                  </p>
                  <p className="mt-auto pt-3 text-sm text-muted">
                    <span className="font-semibold text-ink">{c.enrolled}</span> students ·{" "}
                    <span className="font-semibold text-ink">{c.completed}</span> completed
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
