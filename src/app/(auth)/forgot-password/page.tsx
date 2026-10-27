"use client"

import Link from "next/link"
import { useActionState } from "react"
import { requestPasswordReset, type AuthState } from "../actions"
import { Field, FormError, SubmitButton } from "@/components/form-bits"

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<AuthState, FormData>(requestPasswordReset, {})

  return (
    <>
      <title>Reset your password · Veyro</title>
      <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-navy">Reset your password</h1>
      {state.sentTo ? (
        <div className="mt-8 rounded-lg border border-line bg-soft p-5" role="status">
          <p>
            If an account exists for <strong>{state.sentTo}</strong>, you&rsquo;ll get an email with a link to choose a
            new password. Open it on this device.
          </p>
          <p className="mt-4 text-sm">
            <Link href="/sign-in" className="link">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form action={action} className="mt-8 space-y-5" noValidate>
          <p className="text-muted">Enter the email you signed up with and we&rsquo;ll send you a reset link.</p>
          <FormError message={state.error} />
          <Field label="Email" name="email" type="email" autoComplete="email" required error={state.fieldErrors?.email} />
          <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
          <p className="text-sm">
            <Link href="/sign-in" className="link">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </>
  )
}
