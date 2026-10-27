import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getAdminSection, requireAdmin } from "@/lib/admin"
import { SectionForm } from "@/app/admin/_components/section-form"

export const metadata: Metadata = { title: "Edit section", robots: { index: false } }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function EditSectionPage({ params }: PageProps<"/admin/courses/[id]/sections/[sectionId]">) {
  return (
    <Suspense fallback={<div className="skeleton h-[40rem]" />}>
      <Editor params={params} />
    </Suspense>
  )
}

async function Editor({ params }: { params: Promise<{ id: string; sectionId: string }> }) {
  const { id, sectionId } = await params
  if (!UUID.test(id) || !UUID.test(sectionId)) notFound()
  await requireAdmin(`/admin/courses/${id}/sections/${sectionId}`)
  const s = await getAdminSection(sectionId)
  if (!s || s.courseId !== id) notFound()

  return (
    <>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link href="/admin/courses" className="link">
          Courses
        </Link>
        <span className="text-muted">›</span>
        <Link href={`/admin/courses/${id}`} className="link">
          {s.courseTitle}
        </Link>
        <span className="text-muted">›</span>
        <span className="text-muted">
          Module {s.modulePosition + 1}: {s.moduleTitle}
        </span>
      </nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[clamp(1.6rem,1.2rem+1.2vw,2.2rem)] font-bold tracking-[-0.03em] text-navy">Edit section</h1>
        <Link href={`/learn/${s.courseSlug}/${s.id}`} className="btn btn-outline">
          View as learner
        </Link>
      </div>
      <div className="card mt-6 p-5 sm:p-8">
        <SectionForm
          initial={{
            id: s.id,
            courseId: s.courseId,
            title: s.title,
            minutes: Math.max(1, Math.round(s.durationSec / 60)),
            isPreview: s.isPreview,
            videoRef: s.videoRef,
            bodyMd: s.bodyMd,
          }}
        />
      </div>
    </>
  )
}
