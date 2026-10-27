import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export type CurrentUser = {
  id: string
  email: string
  fullName: string
  role: "student" | "instructor" | "admin"
}

/** The signed-in user (validated token + profile), or null. Deduplicated per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", claims.sub)
    .maybeSingle()

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    fullName: profile?.full_name ?? "",
    role: profile?.role ?? "student",
  }
})

export async function requireUser(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(next)}`)
  return user
}

/** Only allow same-site relative redirects after auth (prevents open redirects). */
export function safeNext(value: unknown, fallback = "/my-learning"): string {
  if (typeof value !== "string") return fallback
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback
  return value
}

export function firstName(user: Pick<CurrentUser, "fullName" | "email">) {
  return user.fullName.trim().split(/\s+/)[0] || user.email.split("@")[0] || "there"
}
