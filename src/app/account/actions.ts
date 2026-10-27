"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export type ProfileState = { error?: string; saved?: boolean; fieldErrors?: { fullName?: string; headline?: string } }

export async function updateProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const parsed = z
    .object({
      fullName: z.string().trim().min(1, "Enter your name.").max(120, "Use 120 characters or fewer."),
      headline: z.string().trim().max(160, "Use 160 characters or fewer."),
    })
    .safeParse({ fullName: formData.get("fullName") ?? "", headline: formData.get("headline") ?? "" })
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors
    return { fieldErrors: { fullName: f.fullName?.[0], headline: f.headline?.[0] } }
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) return { error: "Your session has ended. Sign in again." }

  // Column privileges only allow these two fields; RLS limits the row to the caller.
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, headline: parsed.data.headline || null })
    .eq("id", userId)
  if (error) return { error: "Couldn't save your profile. Try again." }

  revalidatePath("/", "layout")
  return { saved: true }
}
