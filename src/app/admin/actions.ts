"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/format"
import { parseYouTubeId } from "@/lib/youtube-id"

export type AdminState = { error?: string; ok?: string; fieldErrors?: Record<string, string | undefined> }

const MOTIFS = ["grid", "network", "curve", "lines", "orbit"] as const
const TONES = ["lapis", "ink", "moss", "plum", "rust"] as const

async function adminClient() {
  const user = await getCurrentUser()
  if (!user || user.role !== "admin") throw new Error("Admins only.")
  return createClient()
}

function friendly(message: string) {
  const m = message.toLowerCase()
  if (m.includes("courses_slug_key") || (m.includes("duplicate") && m.includes("slug"))) return "Another course already uses that web address."
  if (m.includes("enrollments_course_id_fkey")) return "Students are enrolled in this course, so it can't be deleted. Set its status to Archived instead."
  if (m.includes("row-level security") || m.includes("permission denied") || m.includes("admins only")) return "Only admins can do that."
  return message
}

/* ---------------------------------------------------------------- courses */

const courseSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(3, "Give the course a title (at least 3 characters).").max(140),
  slug: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only.")
    .optional()
    .or(z.literal("")),
  subtitle: z.string().trim().max(220, "Keep the subtitle under 220 characters.").optional(),
  description: z.string().trim().max(5000).optional(),
  outcomes: z.string().max(3000).optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.string().trim().max(60).optional(),
  newCategory: z.string().trim().max(40).optional(),
  coverMotif: z.enum(MOTIFS),
  coverTone: z.enum(TONES),
  status: z.enum(["draft", "published", "archived"]),
})

export async function saveCourse(_: AdminState, formData: FormData): Promise<AdminState> {
  const raw = Object.fromEntries(
    ["id", "title", "slug", "subtitle", "description", "outcomes", "level", "category", "newCategory", "coverMotif", "coverTone", "status"].map(
      (k) => [k, formData.get(k) === null || formData.get(k) === "" && k === "id" ? undefined : String(formData.get(k))],
    ),
  )
  const parsed = courseSchema.safeParse(raw)
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors
    return { error: "Check the highlighted fields.", fieldErrors: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])) }
  }
  const d = parsed.data
  let supabase
  try {
    supabase = await adminClient()
  } catch {
    return { error: "Only admins can do that." }
  }

  // Subject: an existing one, or a new one typed in.
  let category: string | null = d.category || null
  if (d.newCategory) {
    const slug = slugify(d.newCategory)
    if (!slug) return { fieldErrors: { newCategory: "Use letters or numbers in the subject name." }, error: "Check the highlighted fields." }
    const { error } = await supabase.from("categories").upsert({ slug, name: d.newCategory, sort_order: 100 }, { onConflict: "slug", ignoreDuplicates: true })
    if (error) return { error: friendly(error.message) }
    category = slug
  }

  const row = {
    title: d.title,
    slug: d.slug || slugify(d.title),
    subtitle: d.subtitle || null,
    description: d.description ?? "",
    outcomes: (d.outcomes ?? "")
      .split("\n")
      .map((s) => s.replace(/^[-•*\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 12),
    level: d.level,
    category_slug: category,
    cover_motif: d.coverMotif,
    cover_tone: d.coverTone,
    status: d.status,
  }
  if (!row.slug) return { fieldErrors: { slug: "Add a web address for the course." }, error: "Check the highlighted fields." }

  if (d.id) {
    const { error } = await supabase.from("courses").update(row).eq("id", d.id)
    if (error) return { error: friendly(error.message), fieldErrors: error.message.includes("slug") ? { slug: friendly(error.message) } : undefined }
    return { ok: "Course saved" }
  }

  const { data, error } = await supabase.from("courses").insert(row).select("id").single()
  if (error) return { error: friendly(error.message), fieldErrors: error.message.includes("slug") ? { slug: friendly(error.message) } : undefined }
  redirect(`/admin/courses/${data.id}?created=1`)
}

export async function deleteCourse(id: string): Promise<AdminState> {
  try {
    const supabase = await adminClient()
    const { error } = await supabase.from("courses").delete().eq("id", id)
    if (error) return { error: friendly(error.message) }
  } catch {
    return { error: "Only admins can do that." }
  }
  redirect("/admin/courses?deleted=1")
}

/* ---------------------------------------------------------------- modules */

const moduleSchema = z.object({
  title: z.string().trim().min(1, "Give the module a title.").max(140),
  description: z.string().trim().max(500).optional(),
})

export async function addModule(courseId: string, title: string, description: string): Promise<AdminState> {
  const parsed = moduleSchema.safeParse({ title, description })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  try {
    const supabase = await adminClient()
    const { data: last } = await supabase.from("modules").select("position").eq("course_id", courseId).order("position", { ascending: false }).limit(1)
    const position = (last?.[0]?.position ?? -1) + 1
    const { error } = await supabase
      .from("modules")
      .insert({ course_id: courseId, title: parsed.data.title, description: parsed.data.description || null, position })
    if (error) return { error: friendly(error.message) }
    return { ok: "Module added" }
  } catch {
    return { error: "Only admins can do that." }
  }
}

export async function updateModule(id: string, title: string, description: string): Promise<AdminState> {
  const parsed = moduleSchema.safeParse({ title, description })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  try {
    const supabase = await adminClient()
    const { error } = await supabase.from("modules").update({ title: parsed.data.title, description: parsed.data.description || null }).eq("id", id)
    if (error) return { error: friendly(error.message) }
    return { ok: "Module saved" }
  } catch {
    return { error: "Only admins can do that." }
  }
}

export async function deleteModule(id: string): Promise<AdminState> {
  try {
    const supabase = await adminClient()
    const { error } = await supabase.from("modules").delete().eq("id", id)
    if (error) return { error: friendly(error.message) }
    return { ok: "Module deleted" }
  } catch {
    return { error: "Only admins can do that." }
  }
}

export async function moveModule(id: string, direction: -1 | 1): Promise<AdminState> {
  try {
    const supabase = await adminClient()
    const { error } = await supabase.rpc("admin_move_module", { p_module_id: id, p_direction: direction })
    if (error) return { error: friendly(error.message) }
    return {}
  } catch {
    return { error: "Only admins can do that." }
  }
}

/* ---------------------------------------------------------------- sections */

export async function addSection(moduleId: string, courseId: string, title: string): Promise<AdminState & { id?: string }> {
  const clean = title.trim()
  if (!clean) return { error: "Give the section a title." }
  if (clean.length > 160) return { error: "Keep the title under 160 characters." }
  try {
    const supabase = await adminClient()
    const { data: last } = await supabase.from("lessons").select("position").eq("module_id", moduleId).order("position", { ascending: false }).limit(1)
    const position = (last?.[0]?.position ?? -1) + 1
    const { data, error } = await supabase
      .from("lessons")
      .insert({ module_id: moduleId, course_id: courseId, title: clean, type: "article", position, duration_sec: 300 })
      .select("id")
      .single()
    if (error) return { error: friendly(error.message) }
    const { error: contentError } = await supabase.from("lesson_contents").insert({ lesson_id: data.id, body_md: "" })
    if (contentError) return { error: friendly(contentError.message) }
    return { ok: "Section added", id: data.id }
  } catch {
    return { error: "Only admins can do that." }
  }
}

const sectionSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  title: z.string().trim().min(1, "Give the section a title.").max(160),
  minutes: z.coerce.number({ message: "Enter the length in minutes." }).int().min(1, "At least 1 minute.").max(720, "Up to 720 minutes."),
  video: z.string().trim().max(300).optional(),
  body: z.string().max(60000, "The notes are too long.").optional(),
})

export async function saveSection(_: AdminState, formData: FormData): Promise<AdminState> {
  const parsed = sectionSchema.safeParse({
    id: formData.get("id"),
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    minutes: formData.get("minutes"),
    video: formData.get("video") ?? "",
    body: formData.get("body") ?? "",
  })
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors
    return { error: "Check the highlighted fields.", fieldErrors: Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v?.[0]])) }
  }
  const d = parsed.data
  const videoRef = d.video ? parseYouTubeId(d.video) : null
  if (d.video && !videoRef) return { error: "Check the highlighted fields.", fieldErrors: { video: "That doesn't look like a YouTube link." } }

  try {
    const supabase = await adminClient()
    const { error } = await supabase
      .from("lessons")
      .update({ title: d.title, duration_sec: d.minutes * 60, is_preview: formData.get("isPreview") === "on" })
      .eq("id", d.id)
    if (error) return { error: friendly(error.message) }
    const { error: contentError } = await supabase.from("lesson_contents").upsert(
      {
        lesson_id: d.id,
        body_md: d.body ?? "",
        video_provider: videoRef ? "youtube" : null,
        video_ref: videoRef,
        attribution: null,
      },
      { onConflict: "lesson_id" },
    )
    if (contentError) return { error: friendly(contentError.message) }
    return { ok: "Section saved" }
  } catch {
    return { error: "Only admins can do that." }
  }
}

/** Add, change (a YouTube link) or remove (an empty link) a section's video. */
export async function setSectionVideo(id: string, link: string): Promise<AdminState> {
  const clean = link.trim()
  const videoRef = clean ? parseYouTubeId(clean) : null
  if (clean && !videoRef) return { error: "That doesn't look like a YouTube link. Paste the link from the video's Share button." }
  try {
    const supabase = await adminClient()
    const { data: existing } = await supabase.from("lesson_contents").select("lesson_id").eq("lesson_id", id).maybeSingle()
    const patch = { video_provider: videoRef ? "youtube" : null, video_ref: videoRef }
    const { error } = existing
      ? await supabase.from("lesson_contents").update(patch).eq("lesson_id", id)
      : await supabase.from("lesson_contents").insert({ lesson_id: id, body_md: "", ...patch })
    if (error) return { error: friendly(error.message) }
    return { ok: videoRef ? "Video saved" : "Video removed" }
  } catch {
    return { error: "Only admins can do that." }
  }
}

export async function deleteSection(id: string, courseId: string): Promise<AdminState> {
  try {
    const supabase = await adminClient()
    const { error } = await supabase.from("lessons").delete().eq("id", id)
    if (error) return { error: friendly(error.message) }
  } catch {
    return { error: "Only admins can do that." }
  }
  redirect(`/admin/courses/${courseId}?sectionDeleted=1`)
}

export async function deleteSectionInline(id: string): Promise<AdminState> {
  try {
    const supabase = await adminClient()
    const { error } = await supabase.from("lessons").delete().eq("id", id)
    if (error) return { error: friendly(error.message) }
    return { ok: "Section deleted" }
  } catch {
    return { error: "Only admins can do that." }
  }
}

export async function moveSection(id: string, direction: -1 | 1): Promise<AdminState> {
  try {
    const supabase = await adminClient()
    const { error } = await supabase.rpc("admin_move_lesson", { p_lesson_id: id, p_direction: direction })
    if (error) return { error: friendly(error.message) }
    return {}
  } catch {
    return { error: "Only admins can do that." }
  }
}
