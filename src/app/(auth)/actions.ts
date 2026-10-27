"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { safeNext } from "@/lib/auth"

export type AuthState = {
  error?: string
  fieldErrors?: Partial<Record<"fullName" | "email" | "password", string>>
  sentTo?: string
  values?: { fullName?: string; email?: string }
}

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  const h = await headers()
  const origin = h.get("origin")
  if (origin) return origin
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}`
}

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254)
const password = z.string().min(8, "Use at least 8 characters.").max(72, "Use 72 characters or fewer.")

function friendlyAuthError(message: string) {
  const m = message.toLowerCase()
  if (m.includes("invalid login credentials")) return "That email and password don't match an account."
  if (m.includes("email not confirmed")) return "Confirm your email first — check your inbox for the link we sent."
  if (m.includes("rate limit") || m.includes("security purposes"))
    return "Too many attempts. Wait a minute, then try again."
  if (m.includes("weak") || m.includes("pwned")) return "Choose a stronger password — this one is too easy to guess."
  return message
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = z
    .object({ email, password: z.string().min(1, "Enter your password.") })
    .safeParse({ email: formData.get("email"), password: formData.get("password") })
  const values = { email: String(formData.get("email") ?? "") }
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors
    return { values, fieldErrors: { email: f.email?.[0], password: f.password?.[0] } }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { values, error: friendlyAuthError(error.message) }

  redirect(safeNext(formData.get("next")))
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = z
    .object({
      fullName: z.string().trim().min(1, "Enter your name.").max(120),
      email,
      password,
    })
    .safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    })
  const values = { fullName: String(formData.get("fullName") ?? ""), email: String(formData.get("email") ?? "") }
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors
    return {
      values,
      fieldErrors: { fullName: f.fullName?.[0], email: f.email?.[0], password: f.password?.[0] },
    }
  }

  const next = safeNext(formData.get("next"))
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })
  if (error) return { values, error: friendlyAuthError(error.message) }

  // Email confirmation disabled in Supabase → already signed in.
  if (data.session) redirect(next)
  return { sentTo: parsed.data.email }
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = email.safeParse(formData.get("email"))
  if (!parsed.success) return { fieldErrors: { email: parsed.error.issues[0]?.message } }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/account/update-password`,
  })
  // Don't reveal whether an account exists; only surface rate limiting.
  if (error && /rate limit|security purposes/i.test(error.message)) return { error: friendlyAuthError(error.message) }
  return { sentTo: parsed.data }
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = password.safeParse(formData.get("password"))
  if (!parsed.success) return { fieldErrors: { password: parsed.error.issues[0]?.message } }
  if (formData.get("password") !== formData.get("confirm")) {
    return { fieldErrors: { password: "The two passwords don't match." } }
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) return { error: "Your reset link has expired. Request a new one." }

  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) return { error: friendlyAuthError(error.message) }
  redirect("/my-learning?notice=password-updated")
}
