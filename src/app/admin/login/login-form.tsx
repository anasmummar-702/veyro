"use client"

import { use, useActionState } from "react"
import { Field, FormError, SubmitButton } from "@/components/form-bits"
import { adminSignIn, type AdminLoginState } from "./actions"

export function AdminLoginForm({ params }: { params: Promise<{ next: string; notice: string }> }) {
  const { next, notice } = use(params)
  const [state, action] = useActionState<AdminLoginState, FormData>(adminSignIn, {})
  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      {notice && !state.error && (
        <p role="status" className="rounded-md border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm font-medium text-brand">
          {notice}
        </p>
      )}
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next} />
      <Field label="Admin email" name="email" type="email" autoComplete="username" required defaultValue={state.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <SubmitButton pendingLabel="Signing in…">Sign in to admin</SubmitButton>
    </form>
  )
}
