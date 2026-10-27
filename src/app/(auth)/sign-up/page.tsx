import type { Metadata } from "next"
import { Suspense } from "react"
import { SignUpForm } from "./sign-up-form"

export const metadata: Metadata = { title: "Create your account" }

export default function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  return (
    <>
      <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-navy">Sign up for free</h1>
      <p className="mt-3 text-muted">Enroll in any course and Veyro keeps track of what you&rsquo;ve finished.</p>
      <Suspense fallback={<div className="mt-8 h-96" />}>
        <SignUpForm next={searchParams.then((p) => (typeof p.next === "string" ? p.next : ""))} />
      </Suspense>
    </>
  )
}
