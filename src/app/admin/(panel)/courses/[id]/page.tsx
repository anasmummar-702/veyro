import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getAdminCourse, getAdminOverview, listAllCategories, requireAdmin } from "@/lib/admin"
import { CourseForm } from "@/app/admin/_components/course-form"
import { CurriculumBuilder } from "@/app/admin/_components/curriculum-builder"
import { DeleteCourse } from "@/app/admin/_components/delete-course"
import { StatusBadge } from "@/app/admin/_components/ui"

export const metadata: Metadata = { title: "Edit course", robots: { index: false } }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function EditCoursePage({ params, searchParams }: PageProps<"/admin/courses/[id]">) {
  return (
    <>
      <Link href="/admin/courses" className="link text-sm">
        ← All courses
      </Link>
      <Suspense fallback={<div className="skeleton mt-6 h-[40rem]" />}>
        <Editor params={params} notice={searchParams.then((p) => (p.created ? "Course created. Now add its modules and sections." : p.sectionDeleted ? "Section deleted." : ""))} />
      </Suspense>
    </>
  )
}

async function Editor({ params, notice }: { params: Promise<{ id: string }>; notice: Promise<string> }) {
  const { id } = await params
  if (!UUID.test(id)) notFound()
  await requireAdmin(`/admin/courses/${id}`)
  const [course, categories, overview, message] = await Promise.all([getAdminCourse(id), listAllCategories(), getAdminOverview(), notice])
  if (!course) notFound()
  const stats = overview.courses.find((c) => c.id === id)
  const sectionCount = course.modules.reduce((n, m) => n + m.sections.length, 0)
  const videoCount = course.modules.reduce((n, m) => n + m.sections.filter((s) => s.hasVideo).length, 0)

  return (
    <>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[clamp(1.6rem,1.2rem+1.2vw,2.2rem)] font-bold tracking-[-0.03em] text-navy">{course.title}</h1>
            <StatusBadge status={course.status} />
          </div>
          <p className="mt-1.5 text-muted">
            {course.modules.length} modules · {sectionCount} sections · {videoCount} videos · {stats?.enrolled ?? 0} students
          </p>
        </div>
        <Link href={`/courses/${course.slug}`} className="btn btn-outline">
          View course page
        </Link>
      </div>

      {message && (
        <p role="status" className="mt-6 rounded-lg border border-success/30 bg-success-50 px-4 py-3 font-semibold text-success">
          {message}
        </p>
      )}

      <section className="mt-8" aria-labelledby="curriculum-heading">
        <h2 id="curriculum-heading" className="text-xl font-bold tracking-[-0.02em]">
          Modules and sections
        </h2>
        <p className="mt-1 text-muted">Add modules, then sections inside them. Open a section to add its video, notes and practice.</p>
        <div className="mt-4">
          <CurriculumBuilder courseId={course.id} modules={course.modules} />
        </div>
      </section>

      <details className="card group mt-10" open={course.modules.length === 0}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-xl font-bold tracking-[-0.02em]">Course details</span>
            <span className="block text-sm text-muted">Title, description, outcomes, subject, cover and status</span>
          </span>
          <span className="text-sm font-semibold text-brand group-open:hidden">Edit details</span>
        </summary>
        <div className="border-t border-line p-5 sm:p-8">
          <CourseForm
            initial={{
              id: course.id,
              title: course.title,
              slug: course.slug,
              subtitle: course.subtitle ?? "",
              description: course.description,
              outcomes: course.outcomes,
              level: course.level,
              categorySlug: course.categorySlug,
              coverMotif: course.coverMotif,
              coverTone: course.coverTone,
              status: course.status,
            }}
            categories={categories}
          />
        </div>
      </details>

      <section className="mt-10 rounded-2xl border border-danger/25 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-danger">Delete course</h2>
        <p className="mt-1 text-sm text-muted">Removes the course with all its modules, sections and videos. This can&rsquo;t be undone.</p>
        <div className="mt-4">
          <DeleteCourse id={course.id} enrolled={stats?.enrolled ?? 0} />
        </div>
      </section>
    </>
  )
}
