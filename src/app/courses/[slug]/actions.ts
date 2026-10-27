"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getCourseBySlug, getMyCourseProgress, resumeHref } from "@/lib/data"

export type EnrollState = { error?: string }

const input = z.object({
  courseId: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
})

export async function enroll(_: EnrollState, formData: FormData): Promise<EnrollState> {
  const parsed = input.safeParse({ courseId: formData.get("courseId"), slug: formData.get("slug") })
  if (!parsed.success) return { error: "Something went wrong. Reload the page and try again." }
  const { courseId, slug } = parsed.data

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) redirect(`/sign-in?next=${encodeURIComponent(`/courses/${slug}`)}`)

  const { data: enrollment, error } = await supabase.rpc("enroll_in_course", { p_course_id: courseId })
  if (error) {
    return {
      error:
        error.code === "P0002"
          ? "This course isn't open for enrollment right now."
          : "We couldn't enroll you. Try again in a moment.",
    }
  }

  // Go straight to the lesson (client navigation doesn't follow route-handler redirects).
  const course = await getCourseBySlug(slug)
  const progress = await getMyCourseProgress(courseId, data!.claims.sub)
  redirect(course ? resumeHref(slug, course, enrollment?.last_lesson_id ?? null, progress) : `/courses/${slug}`)
}
