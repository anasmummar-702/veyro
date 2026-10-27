"use client"

import Link from "next/link"
import { use, useActionState } from "react"
import { signIn, type AuthState } from "../actions"
import { Field, FormError, SubmitButton } from "@/components/form-bits"

export function SignInForm({ params }: { params: Promise<{ next: string; linkError: boolean }> }) {
  const { next, linkError } = use(params)
  const [state, action] = useActionState<AuthState, FormData>(signIn, {})
  const signUpHref = next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"

  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      {linkError && !state.error && (
        <FormError message="That link has expired or was already used. Sign in, or request a new link." />
      )}
      <FormError message={state.error} />
      <input type="hidden" name="next" value={next} />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email}
      />
      <div>
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />
        <p className="mt-2 text-sm">
          <Link href="/forgot-password" className="link">
            Forgot your password?
          </Link>
        </p>
      </div>
      <SubmitButton pendingLabel="Logging in…">Log in</SubmitButton>
      <p className="text-sm text-muted">
        New to Veyro?{" "}
        <Link href={signUpHref} className="link">
          Sign up for free
        </Link>
      </p>
    </form>
  )
}
