"use client"

import { useActionState } from "react"
import { enroll, type EnrollState } from "./actions"
import { SubmitButton } from "@/components/form-bits"

export function EnrollButton({ courseId, slug }: { courseId: string; slug: string }) {
  const [state, action] = useActionState<EnrollState, FormData>(enroll, {})
  return (
    <form action={action}>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="slug" value={slug} />
      <SubmitButton className="btn btn-primary btn-lg w-full sm:w-auto" pendingLabel="Enrolling…">
        Enroll for free
      </SubmitButton>
      {state.error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-danger">
          {state.error}
        </p>
      )}
    </form>
  )
}
