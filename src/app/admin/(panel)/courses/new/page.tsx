import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { listAllCategories, requireAdmin } from "@/lib/admin"
import { CourseForm, EMPTY_COURSE } from "@/app/admin/_components/course-form"
import { PageHeader } from "@/app/admin/_components/ui"

export const metadata: Metadata = { title: "New course", robots: { index: false } }

export default function NewCoursePage() {
  return (
    <>
      <Link href="/admin/courses" className="link text-sm">
        ← All courses
      </Link>
      <div className="mt-3">
        <PageHeader title="New course" subtitle="Start with the basics. You can change everything later." />
      </div>
      <div className="card mt-6 p-6 sm:p-8">
        <Suspense fallback={<div className="skeleton h-96" />}>
          <NewCourse />
        </Suspense>
      </div>
    </>
  )
}

async function NewCourse() {
  await requireAdmin("/admin/courses/new")
  const categories = await listAllCategories()
  return <CourseForm initial={EMPTY_COURSE} categories={categories} />
}
