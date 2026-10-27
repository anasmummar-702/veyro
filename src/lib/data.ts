import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { Enums, Tables } from "@/lib/database.types"

export type CoverMotif = "grid" | "network" | "curve" | "lines" | "orbit"
export type CoverTone = "lapis" | "ink" | "moss" | "plum" | "rust"

export type CourseSummary = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  level: Enums<"course_level">
  coverMotif: CoverMotif
  coverTone: CoverTone
  category: { slug: string; name: string } | null
  instructorName: string
  lessonCount: number
  durationSec: number
}

export type LessonOutline = Pick<
  Tables<"lessons">,
  "id" | "title" | "type" | "position" | "duration_sec" | "is_preview" | "is_required" | "has_video"
>

export type ModuleOutline = {
  id: string
  title: string
  description: string | null
  position: number
  lessons: LessonOutline[]
}

export type CourseDetail = CourseSummary & {
  description: string
  outcomes: string[]
  language: string
  instructorHeadline: string | null
  modules: ModuleOutline[]
}

export type LessonProgress = Pick<
  Tables<"lesson_progress">,
  "lesson_id" | "is_completed" | "watched_sec" | "last_position_sec"
>

const SUMMARY_SELECT = `
  id, slug, title, subtitle, level, cover_motif, cover_tone,
  category:categories(slug, name),
  instructor:profiles(full_name),
  lessons(duration_sec)
` as const

type SummaryRow = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  level: Enums<"course_level">
  cover_motif: string
  cover_tone: string
  category: { slug: string; name: string } | null
  instructor: { full_name: string } | null
  lessons: { duration_sec: number }[]
}

function toSummary(row: SummaryRow): CourseSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    level: row.level,
    coverMotif: row.cover_motif as CoverMotif,
    coverTone: row.cover_tone as CoverTone,
    category: row.category,
    instructorName: row.instructor?.full_name || "Veyro",
    lessonCount: row.lessons.length,
    durationSec: row.lessons.reduce((sum, l) => sum + l.duration_sec, 0),
  }
}

export const listCategories = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.from("categories").select("slug, name").order("sort_order")
  if (error) throw new Error(`Could not load categories: ${error.message}`)
  return data
})

export async function listCourses(filters: { q?: string; category?: string; level?: string } = {}) {
  const supabase = await createClient()
  let query = supabase
    .from("courses")
    .select(SUMMARY_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })

  const q = filters.q?.trim().slice(0, 100)
  if (q) query = query.textSearch("search", q, { type: "websearch", config: "english" })
  if (filters.category) query = query.eq("category_slug", filters.category)
  if (filters.level && ["beginner", "intermediate", "advanced"].includes(filters.level)) {
    query = query.eq("level", filters.level as Enums<"course_level">)
  }

  const { data, error } = await query.returns<SummaryRow[]>()
  if (error) throw new Error(`Could not load courses: ${error.message}`)
  return data.map(toSummary)
}

export const getCourseBySlug = cache(async (slug: string): Promise<CourseDetail | null> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select(
      `id, slug, title, subtitle, description, outcomes, language, level, cover_motif, cover_tone,
       category:categories(slug, name),
       instructor:profiles(full_name, headline),
       modules(id, title, description, position,
         lessons(id, title, type, position, duration_sec, is_preview, is_required, has_video))`,
    )
    .eq("slug", slug)
    .maybeSingle()
  if (error) throw new Error(`Could not load course: ${error.message}`)
  if (!data) return null

  const modules: ModuleOutline[] = [...data.modules]
    .sort((a, b) => a.position - b.position)
    .map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.position - b.position) }))
  const allLessons = modules.flatMap((m) => m.lessons)

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    outcomes: data.outcomes,
    language: data.language,
    level: data.level,
    coverMotif: data.cover_motif as CoverMotif,
    coverTone: data.cover_tone as CoverTone,
    category: data.category,
    instructorName: data.instructor?.full_name || "Veyro",
    instructorHeadline: data.instructor?.headline ?? null,
    lessonCount: allLessons.length,
    durationSec: allLessons.reduce((s, l) => s + l.duration_sec, 0),
    modules,
  }
})

/** The current user's enrollment in a course (RLS limits rows to their own). */
export const getMyEnrollment = cache(async (courseId: string, userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, status, enrolled_at, completed_at, last_lesson_id")
    .eq("course_id", courseId)
    .eq("user_id", userId)
    .in("status", ["active", "completed"])
    .maybeSingle()
  if (error) throw new Error(`Could not load enrollment: ${error.message}`)
  return data
})

export const getMyCourseProgress = cache(async (courseId: string, userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, is_completed, watched_sec, last_position_sec")
    .eq("course_id", courseId)
    .eq("user_id", userId)
  if (error) throw new Error(`Could not load progress: ${error.message}`)
  return new Map<string, LessonProgress>(data.map((p) => [p.lesson_id, p]))
})

export async function getLessonContent(lessonId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("lesson_contents")
    .select("body_md, video_provider, video_ref, attribution")
    .eq("lesson_id", lessonId)
    .maybeSingle()
  if (error) throw new Error(`Could not load lesson: ${error.message}`)
  return data
}

export function courseCompletion(course: Pick<CourseDetail, "modules">, progress: Map<string, LessonProgress>) {
  const required = course.modules.flatMap((m) => m.lessons).filter((l) => l.is_required)
  const done = required.filter((l) => progress.get(l.id)?.is_completed).length
  return { done, total: required.length, ratio: required.length ? done / required.length : 0 }
}

/** First required lesson not yet completed, else the first lesson. */
export function nextLessonId(course: Pick<CourseDetail, "modules">, progress: Map<string, LessonProgress>) {
  const lessons = course.modules.flatMap((m) => m.lessons)
  return (lessons.find((l) => l.is_required && !progress.get(l.id)?.is_completed) ?? lessons[0])?.id ?? null
}

/** Where "Resume" should go: the last opened lesson, else the next unfinished one. */
export function resumeHref(
  slug: string,
  course: Pick<CourseDetail, "modules">,
  lastLessonId: string | null,
  progress: Map<string, LessonProgress>,
) {
  const ids = new Set(course.modules.flatMap((m) => m.lessons.map((l) => l.id)))
  const id = lastLessonId && ids.has(lastLessonId) ? lastLessonId : nextLessonId(course, progress)
  return id ? `/learn/${slug}/${id}` : `/courses/${slug}`
}

export type MyCourse = {
  enrollmentId: string
  status: Enums<"enrollment_status">
  enrolledAt: string
  completedAt: string | null
  lastActivityAt: string
  lastLessonTitle: string | null
  resumeHref: string
  course: CourseSummary
  done: number
  total: number
}

export async function listMyCourses(userId: string): Promise<MyCourse[]> {
  const supabase = await createClient()
  const [enrollments, completed] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `id, status, enrolled_at, completed_at, last_activity_at, last_lesson_id,
         course:courses(id, slug, title, subtitle, level, cover_motif, cover_tone,
           category:categories(slug, name),
           instructor:profiles(full_name),
           modules(id, title, description, position,
             lessons(id, title, type, position, duration_sec, is_preview, is_required, has_video)))`,
      )
      .eq("user_id", userId)
      .in("status", ["active", "completed"])
      .order("last_activity_at", { ascending: false }),
    supabase
      .from("lesson_progress")
      .select("lesson_id, is_completed, watched_sec, last_position_sec")
      .eq("user_id", userId)
      .eq("is_completed", true),
  ])
  if (enrollments.error) throw new Error(`Could not load your courses: ${enrollments.error.message}`)
  if (completed.error) throw new Error(`Could not load your progress: ${completed.error.message}`)

  const progress = new Map<string, LessonProgress>(completed.data.map((p) => [p.lesson_id, p]))

  return enrollments.data
    .filter((e) => e.course)
    .map((e) => {
      const c = e.course!
      const modules = [...c.modules]
        .sort((a, b) => a.position - b.position)
        .map((m) => ({ ...m, lessons: [...m.lessons].sort((a, b) => a.position - b.position) }))
      const lessons = modules.flatMap((m) => m.lessons)
      const required = lessons.filter((l) => l.is_required)
      return {
        enrollmentId: e.id,
        status: e.status,
        enrolledAt: e.enrolled_at,
        completedAt: e.completed_at,
        lastActivityAt: e.last_activity_at,
        lastLessonTitle: lessons.find((l) => l.id === e.last_lesson_id)?.title ?? null,
        resumeHref: resumeHref(c.slug, { modules }, e.last_lesson_id, progress),
        course: toSummary({ ...c, lessons }),
        done: required.filter((l) => progress.has(l.id)).length,
        total: required.length,
      }
    })
}

/* ---------------------------------------------------------------- certificates */

export type Certificate = {
  serial: string
  recipientName: string
  courseTitle: string
  courseSlug: string
  issuedAt: string
}

export type MyCertificate = Certificate & { coverMotif: CoverMotif; coverTone: CoverTone }

/**
 * The signed-in learner's certificates. Uses claim_my_certificates(), which also
 * issues any certificate still missing for a completed course.
 */
export async function listMyCertificates(): Promise<MyCertificate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("claim_my_certificates")
  if (error) throw new Error(`Could not load your certificates: ${error.message}`)
  if (!data.length) return []

  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, slug, cover_motif, cover_tone")
    .in(
      "id",
      data.map((c) => c.course_id),
    )
  if (coursesError) throw new Error(`Could not load your certificates: ${coursesError.message}`)
  const byId = new Map(courses.map((c) => [c.id, c]))

  return data.map((c) => {
    const course = byId.get(c.course_id)
    return {
      serial: c.serial,
      recipientName: c.recipient_name,
      courseTitle: c.course_title,
      courseSlug: course?.slug ?? "",
      issuedAt: c.issued_at,
      coverMotif: (course?.cover_motif ?? "grid") as CoverMotif,
      coverTone: (course?.cover_tone ?? "lapis") as CoverTone,
    }
  })
}

const SERIAL = /^VEY-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

/** Public lookup of a certificate by serial; null when it doesn't exist. */
export const verifyCertificate = cache(async (serial: string): Promise<Certificate | null> => {
  const clean = serial.trim().toUpperCase()
  if (!SERIAL.test(clean)) return null
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("verify_certificate", { p_serial: clean })
  if (error) throw new Error(`Could not check that certificate: ${error.message}`)
  const row = data[0]
  if (!row) return null
  return {
    serial: row.serial,
    recipientName: row.recipient_name,
    courseTitle: row.course_title,
    courseSlug: row.course_slug,
    issuedAt: row.issued_at,
  }
})

/* ---------------------------------------------------------------- admin: class videos */

export type AdminCourse = {
  id: string
  slug: string
  title: string
  modules: {
    id: string
    title: string
    position: number
    lessons: { id: string; title: string; position: number; videoRef: string | null }[]
  }[]
}

/** Every course the signed-in admin can manage, with each class's current video. */
export async function listCoursesForVideoAdmin(): Promise<AdminCourse[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courses")
    .select(
      `id, slug, title, published_at,
       modules(id, title, position,
         lessons(id, title, position, content:lesson_contents(video_ref)))`,
    )
    .order("published_at", { ascending: false })
  if (error) throw new Error(`Could not load courses: ${error.message}`)
  return data.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    modules: [...c.modules]
      .sort((a, b) => a.position - b.position)
      .map((m) => ({
        id: m.id,
        title: m.title,
        position: m.position,
        lessons: [...m.lessons]
          .sort((a, b) => a.position - b.position)
          .map((l) => {
            const content = Array.isArray(l.content) ? l.content[0] : l.content
            return { id: l.id, title: l.title, position: l.position, videoRef: content?.video_ref ?? null }
          }),
      })),
  }))
}
