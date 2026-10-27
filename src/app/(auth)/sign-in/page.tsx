import type { Metadata } from "next"
import { Suspense } from "react"
import { SignInForm } from "./sign-in-form"

export const metadata: Metadata = { title: "Sign in" }

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-navy">Log in to Veyro</h1>
      <p className="mt-3 text-muted">Pick up your courses where you left off.</p>
      <Suspense fallback={<div className="mt-8 h-72" />}>
        <SignInForm
          params={searchParams.then((p) => ({
            next: typeof p.next === "string" ? p.next : "",
            linkError: p.error === "link",
          }))}
        />
      </Suspense>
    </>
  )
}
