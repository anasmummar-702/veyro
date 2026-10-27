import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "./profile-form"

export const metadata: Metadata = { title: "Account settings" }

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="h-display !text-[clamp(1.8rem,1.4rem+1.5vw,2.4rem)]">Account settings</h1>
      <Suspense fallback={<div className="mt-10 h-80" />}>
        <AccountDetails />
      </Suspense>
    </div>
  )
}

async function AccountDetails() {
  const user = await requireUser("/account")
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <>
      <section className="card mt-8 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Profile</h2>
        <ProfileForm fullName={profile?.full_name ?? ""} headline={profile?.headline ?? ""} />
      </section>
      <section className="card mt-6 p-6 sm:p-8">
        <h2 className="text-lg font-semibold">Sign-in details</h2>
        <p className="mt-2 text-muted">
          You sign in as <strong>{user.email}</strong>.
        </p>
        <p className="mt-4">
          <Link href="/account/update-password" className="link">
            Change your password
          </Link>
        </p>
      </section>
    </>
  )
}
