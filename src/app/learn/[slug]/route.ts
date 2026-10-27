import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

// /learn/<slug> → the lesson to resume: last opened, else first unfinished required lesson.
export async function GET(request: NextRequest, ctx: RouteContext<"/learn/[slug]">) {
  const { slug } = await ctx.params
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url))

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const userId = claims?.claims?.sub
  if (!userId) return to(`/sign-in?next=${encodeURIComponent(`/learn/${slug}`)}`)

  const { data: course } = await supabase
    .from("courses")
    .select("id, modules(position, lessons(id, position, is_required))")
    .eq("slug", slug)
    .maybeSingle()
  if (!course) return to("/courses")

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("last_lesson_id, status")
    .eq("course_id", course.id)
    .eq("user_id", userId)
    .in("status", ["active", "completed"])
    .maybeSingle()
  if (!enrollment) return to(`/courses/${slug}`)

  const lessons = [...course.modules]
    .sort((a, b) => a.position - b.position)
    .flatMap((m) => [...m.lessons].sort((a, b) => a.position - b.position))
  if (!lessons.length) return to(`/courses/${slug}`)

  let target = enrollment.last_lesson_id && lessons.some((l) => l.id === enrollment.last_lesson_id)
    ? enrollment.last_lesson_id
    : null

  if (!target) {
    const { data: done } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("course_id", course.id)
      .eq("user_id", userId)
      .eq("is_completed", true)
    const doneIds = new Set((done ?? []).map((d) => d.lesson_id))
    target = (lessons.find((l) => l.is_required && !doneIds.has(l.id)) ?? lessons[0]).id
  }

  return to(`/learn/${slug}/${target}`)
}
