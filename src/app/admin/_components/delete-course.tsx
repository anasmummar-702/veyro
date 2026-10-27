"use client"

import { useState, useTransition } from "react"
import { deleteCourse } from "../actions"

export function DeleteCourse({ id, enrolled }: { id: string; enrolled: number }) {
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  return (
    <div>
      {enrolled > 0 ? (
        <p className="text-sm text-muted">
          {enrolled} {enrolled === 1 ? "student is" : "students are"} enrolled, so this course can&rsquo;t be deleted. Set its status to <strong>Archived</strong> to hide it.
        </p>
      ) : confirm ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const res = await deleteCourse(id)
                if (res?.error) setError(res.error)
              })
            }
            className="btn border border-danger bg-danger text-white"
          >
            {pending ? "Deleting…" : "Yes, delete everything"}
          </button>
          <button type="button" onClick={() => setConfirm(false)} className="btn btn-outline">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirm(true)} className="btn border border-danger/40 bg-white text-danger hover:border-danger">
          Delete course
        </button>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-danger">{error}</p>}
    </div>
  )
}
