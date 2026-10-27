"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { safeNext } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export type AdminLoginState = { error?: string; email?: string }

export async function adminSignIn(_: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const parsed = z
    .object({
      email: z.string().trim().toLowerCase().email("Enter a valid email address."),
      password: z.string().min(1, "Enter your password."),
    })
    .safeParse({ email: formData.get("email"), password: formData.get("password") })
  const email = String(formData.get("email") ?? "")
  if (!parsed.success) return { email, error: parsed.error.issues[0]?.message }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.user) {
    const m = (error?.message ?? "").toLowerCase()
    if (m.includes("rate limit") || m.includes("security purposes")) return { email, error: "Too many attempts. Wait a minute, then try again." }
    if (m.includes("email not confirmed")) return { email, error: "Confirm this email address first — check the inbox for the link." }
    return { email, error: "That email and password don't match an admin account." }
  }

  const { data: profile } = await supabase.from("profiles").select("role, status").eq("id", data.user.id).maybeSingle()
  if (profile?.role !== "admin" || profile.status !== "active") {
    await supabase.auth.signOut()
    return { email, error: "This account doesn't have admin access. Use your admin account to sign in here." }
  }

  const next = safeNext(formData.get("next"))
  redirect(next.startsWith("/admin") ? next : "/admin")
}

export async function adminSignOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/admin/login?signedOut=1")
}
