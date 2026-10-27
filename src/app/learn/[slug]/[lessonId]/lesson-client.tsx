"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { getBrowserClient } from "@/lib/supabase/client"
import { CheckIcon } from "@/components/icons"

/** Records the opened lesson so "Resume" returns here. */
export function LessonOpened({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    // Supabase queries are lazy: they only run once awaited/then'd.
    getBrowserClient()
      .rpc("open_lesson", { p_lesson_id: lessonId })
      .then(({ error }) => {
        if (error) console.warn("Couldn't save last opened lesson:", error.message)
      })
  }, [lessonId])
  return null
}

export function MarkAsRead({
  lessonId,
  completed: initiallyCompleted,
  nextHref,
}: {
  lessonId: string
  completed: boolean
  nextHref: string | null
}) {
  const router = useRouter()
  const [completed, setCompleted] = useState(initiallyCompleted)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const markRead = () =>
    startTransition(async () => {
      setError(null)
      const { error } = await getBrowserClient().rpc("complete_article_lesson", { p_lesson_id: lessonId })
      if (error) {
        setError("Couldn't save that. Check your connection and try again.")
        return
      }
      setCompleted(true)
      router.refresh()
    })

  return (
    <div className="flex flex-wrap items-center gap-4">
      {completed ? (
        <p className="flex items-center gap-2 font-semibold text-success" role="status">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
          Completed
        </p>
      ) : (
        <button type="button" onClick={markRead} disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Mark as completed"}
        </button>
      )}
      {completed && nextHref && (
        <Link href={nextHref} className="btn btn-outline ml-auto">
          Go to next item
        </Link>
      )}
      {error && (
        <p role="alert" className="w-full text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
