import "server-only"
import { redirect } from "next/navigation"
import { getCurrentUser, type CurrentUser } from "@/lib/auth"
import type { CoverMotif, CoverTone } from "@/lib/data"
import type { Enums } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"

/** The signed-in admin. Everyone else is sent to the admin sign-in page. */
export async function requireAdmin(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(next)}`)
  if (user.role !== "admin") redirect(`/admin/login?error=not-admin&next=${encodeURIComponent(next)}`)
  return user
}

export type AdminCourseStat = {
  id: string
  slug: string
  title: string
  status: Enums<"course_status">
  modules: number
  sections: number
  videos: number
  enrolled: number
  completed: number
  avg_progress: number
}

export type AdminOverview = {
  students: number
  new_students_7d: number
  active_learners_7d: number
  enrollments: number
  in_progress: number
  completed: number
  certificates: number
  lessons_completed: number
  courses: AdminCourseStat[]
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_overview")
  if (error) throw new Error(`Could not load the dashboard: ${error.message}`)
  return data as unknown as AdminOverview
}

export type AdminStudentCourse = {
  title: string
  slug: string
  status: Enums<"enrollment_status">
  enrolled_at: string
  completed_at: string | null
  last_activity_at: string
  done: number
  total: number
}

export type AdminStudent = {
  id: string
  fullName: string
  email: string
  role: Enums<"app_role">
  status: string
  joinedAt: string
  lastSignInAt: string | null
  lastActivityAt: string | null
  certificates: number
  courses: AdminStudentCourse[]
}

export async function listAdminStudents(): Promise<AdminStudent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_students")
  if (error) throw new Error(`Could not load students: ${error.message}`)
  return data.map((s) => ({
    id: s.id,
    fullName: s.full_name,
    email: s.email,
    role: s.role,
    status: s.status,
    joinedAt: s.joined_at,
    lastSignInAt: s.last_sign_in_at,
    lastActivityAt: s.last_activity_at,
    certificates: s.certificates,
    courses: (s.courses as unknown as AdminStudentCourse[]) ?? [],
  }))
}

export type AdminSection = {
  id: string
  title: string
  position: number
  durationSec: number
  isPreview: boolean
  hasVideo: boolean
  videoRef: string | null
}

export type AdminModule = { id: string; title: string; description: string | null; position: number; sections: AdminSection[] }

export type AdminCourseDetail = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  outcomes: string[]
  level: Enums<"course_level">
  categorySlug: string | null
  coverMotif: CoverMotif
  coverTone: CoverTone
  status: Enums<"course_status">
  modules: AdminModule[]
}

export async function getAdminCourse(id: string): Promise<AdminCourseDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select(
      `id, slug, title, subtitle, description, outcomes, level, category_slug, cover_motif, cover_tone, status,
       modules(id, title, description, position,
         lessons(id, title, position, duration_sec, is_preview, has_video, lesson_contents(video_ref)))`,
    )
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(`Could not load course: ${error.message}`)
  if (!data) return null
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    outcomes: data.outcomes,
    level: data.level,
    categorySlug: data.category_slug,
    coverMotif: data.cover_motif as CoverMotif,
    coverTone: data.cover_tone as CoverTone,
    status: data.status,
    modules: [...data.modules]
      .sort((a, b) => a.position - b.position)
      .map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        position: m.position,
        sections: [...m.lessons]
          .sort((a, b) => a.position - b.position)
          .map((l) => ({
            id: l.id,
            title: l.title,
            position: l.position,
            durationSec: l.duration_sec,
            isPreview: l.is_preview,
            hasVideo: l.has_video,
            videoRef: (Array.isArray(l.lesson_contents) ? l.lesson_contents[0] : l.lesson_contents)?.video_ref ?? null,
          })),
      })),
  }
}

export async function getAdminSection(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lessons")
    .select(
      `id, title, position, duration_sec, is_preview, is_required, module_id, course_id,
       module:modules(title, position),
       course:courses(id, title, slug),
       content:lesson_contents(body_md, video_ref)`,
    )
    .eq("id", id)
    .maybeSingle()
  if (error) throw new Error(`Could not load section: ${error.message}`)
  if (!data) return null
  const content = Array.isArray(data.content) ? data.content[0] : data.content
  return {
    id: data.id,
    title: data.title,
    position: data.position,
    durationSec: data.duration_sec,
    isPreview: data.is_preview,
    isRequired: data.is_required,
    moduleId: data.module_id,
    courseId: data.course_id,
    moduleTitle: data.module?.title ?? "",
    modulePosition: data.module?.position ?? 0,
    courseTitle: data.course?.title ?? "",
    courseSlug: data.course?.slug ?? "",
    bodyMd: content?.body_md ?? "",
    videoRef: content?.video_ref ?? null,
  }
}

export async function listAllCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("slug, name").order("sort_order")
  if (error) throw new Error(`Could not load subjects: ${error.message}`)
  return data
}
