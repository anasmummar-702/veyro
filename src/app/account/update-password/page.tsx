"use client"

import { useActionState } from "react"
import { updatePassword, type AuthState } from "@/app/(auth)/actions"
import { Field, FormError, SubmitButton } from "@/components/form-bits"

export default function UpdatePasswordPage() {
  const [state, action] = useActionState<AuthState, FormData>(updatePassword, {})
  return (
    <div className="mx-auto w-full max-w-md px-4 py-14 sm:px-6">
      <title>Choose a new password · Veyro</title>
      <h1 className="h-display !text-[clamp(1.8rem,1.4rem+1.5vw,2.4rem)]">Choose a new password</h1>
      <form action={action} className="mt-8 space-y-5" noValidate>
        <FormError message={state.error} />
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          error={state.fieldErrors?.password}
        />
        <Field label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
        <SubmitButton pendingLabel="Saving…">Save new password</SubmitButton>
      </form>
    </div>
  )
}
