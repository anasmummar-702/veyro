"use client"

import Link from "next/link"
import { use, useActionState } from "react"
import { signUp, type AuthState } from "../actions"
import { Field, FormError, SubmitButton } from "@/components/form-bits"

export function SignUpForm({ next: nextPromise }: { next: Promise<string> }) {
  const next = use(nextPromise)
  const [state, action] = useActionState<AuthState, FormData>(signUp, {})
  const signInHref = next ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in"

  if (state.sentTo) {
    return (
      <div className="mt-8 rounded-2xl border border-success/30 bg-success-50 p-6" role="status">
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="mt-2 text-muted">
          We sent a confirmation link to <strong>{state.sentTo}</strong>. Open it on this device to
          finish creating your account.
        </p>
        <p className="mt-4 text-sm text-muted">
          No email after a few minutes? Check spam, or{" "}
          <Link href="/sign-up" className="link">
            try again
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next} />
      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        required
        defaultValue={state.values?.fullName}
        error={state.fieldErrors?.fullName}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        hint="At least 8 characters."
        error={state.fieldErrors?.password}
      />
      <SubmitButton pendingLabel="Creating account…">Join for free</SubmitButton>
      <p className="text-sm text-muted">
        Already have an account?{" "}
        <Link href={signInHref} className="link">
          Sign in
        </Link>
      </p>
    </form>
  )
}
