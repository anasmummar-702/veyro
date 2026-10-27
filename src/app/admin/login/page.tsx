import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { LogoMark } from "@/components/site-header"
import { AdminLoginForm } from "./login-form"

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } }

const NOTICES: Record<string, string> = {
  "not-admin": "You're signed in with an account that isn't an admin. Sign in with your admin account.",
  signedOut: "You've signed out of the admin panel.",
}

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = searchParams.then((p) => ({
    next: typeof p.next === "string" ? p.next : "/admin",
    notice: p.error === "not-admin" ? NOTICES["not-admin"] : p.signedOut ? NOTICES.signedOut : "",
  }))
  return (
    <div data-no-footer className="flex flex-1 items-center justify-center bg-gradient-to-b from-navy to-navy-deep px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] sm:p-10">
        <div className="flex items-center gap-3">
          <LogoMark className="h-9 w-9" />
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand ring-1 ring-brand-100">Admin</span>
        </div>
        <h1 className="font-display mt-6 text-3xl font-bold tracking-[-0.03em] text-navy">Admin sign in</h1>
        <p className="mt-2 text-muted">Manage courses, sections, videos and students.</p>
        <Suspense fallback={<div className="mt-8 h-56" />}>
          <AdminLoginForm params={params} />
        </Suspense>
        <p className="mt-8 border-t border-line pt-5 text-sm text-muted">
          Not an admin?{" "}
          <Link href="/sign-in" className="link">
            Go to the learner sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
