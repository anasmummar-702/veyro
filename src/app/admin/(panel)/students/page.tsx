import type { Metadata } from "next"
import { Suspense } from "react"
import { listAdminStudents, requireAdmin } from "@/lib/admin"
import { PageHeader } from "@/app/admin/_components/ui"
import { StudentsTable } from "./students-table"

export const metadata: Metadata = { title: "Students", robots: { index: false } }

export default function StudentsPage() {
  return (
    <>
      <PageHeader title="Students" subtitle="Everyone who has signed up, what they're studying and how far they've got." />
      <Suspense fallback={<div className="skeleton mt-8 h-96" />}>
        <Students />
      </Suspense>
    </>
  )
}

async function Students() {
  await requireAdmin("/admin/students")
  const students = await listAdminStudents()
  return <StudentsTable students={students} />
}
