"use client"

import { useActionState } from "react"
import { updateProfile, type ProfileState } from "./actions"
import { Field, FormError, SubmitButton } from "@/components/form-bits"

export function ProfileForm({ fullName, headline }: { fullName: string; headline: string }) {
  const [state, action] = useActionState<ProfileState, FormData>(updateProfile, {})
  return (
    <form action={action} className="mt-5 space-y-5">
      <FormError message={state.error} />
      <Field label="Full name" name="fullName" defaultValue={fullName} autoComplete="name" required error={state.fieldErrors?.fullName} />
      <Field
        label="Headline"
        name="headline"
        defaultValue={headline}
        hint="Optional. A short line about you, like “Data analyst learning ML”."
        error={state.fieldErrors?.headline}
      />
      <div className="flex items-center gap-4">
        <SubmitButton className="btn btn-primary" pendingLabel="Saving…">
          Save profile
        </SubmitButton>
        {state.saved && (
          <p role="status" className="text-sm font-medium">
            <span className="text-success">Profile saved</span>
          </p>
        )}
      </div>
    </form>
  )
}
