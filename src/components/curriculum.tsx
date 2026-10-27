import Link from "next/link"
import { CheckIcon, ChevronIcon, LessonTypeIcon, LockIcon } from "@/components/icons"
import type { LessonProgress, ModuleOutline } from "@/lib/data"
import { formatDuration, plural } from "@/lib/format"

const TYPE_LABEL = { video: "Video", article: "Reading", quiz: "Quiz" } as const

function moduleSummary(m: ModuleOutline) {
  const videos = m.lessons.filter((l) => l.type === "video" || l.has_video).length
  const readings = m.lessons.filter((l) => l.type === "article").length
  const quizzes = m.lessons.filter((l) => l.type === "quiz").length
  return [
    videos && plural(videos, "video"),
    readings && plural(readings, "reading"),
    quizzes && plural(quizzes, "quiz", "quizzes"),
  ]
    .filter(Boolean)
    .join(", ")
}

/** Course modules, Coursera-style accordion. */
export function Curriculum({
  slug,
  modules,
  enrolled,
  progress,
}: {
  slug: string
  modules: ModuleOutline[]
  enrolled: boolean
  progress?: Map<string, LessonProgress>
}) {
  return (
    <ol className="card divide-y divide-line overflow-hidden">
      {modules.map((m, mi) => {
        const total = m.lessons.reduce((s, l) => s + l.duration_sec, 0)
        return (
          <li key={m.id}>
            <details open={mi === 0} className="group">
              <summary className="flex cursor-pointer list-none items-start gap-4 p-5 hover:bg-soft sm:p-6 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-muted">Module {mi + 1}</span>
                  <span className="mt-0.5 block text-lg font-semibold leading-snug">{m.title}</span>
                  <span className="mt-1 block text-sm text-muted">
                    {formatDuration(total)} to complete · {moduleSummary(m)}
                  </span>
                </span>
                <span className="mt-1 hidden text-sm font-semibold text-brand sm:block group-open:hidden">Module details</span>
                <ChevronIcon className="mt-1 h-5 w-5 shrink-0 text-ink transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                {m.description && <p className="text-muted">{m.description}</p>}
                <ol className={`space-y-1 ${m.description ? "mt-3" : ""}`}>
                  {m.lessons.map((l) => {
                    const isDone = progress?.get(l.id)?.is_completed
                    const open = enrolled || l.is_preview
                    const row = (
                      <>
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                          {isDone ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
                              <CheckIcon className="h-3 w-3" title="Completed" />
                            </span>
                          ) : (
                            <LessonTypeIcon type={l.has_video ? "video" : l.type} className="h-[18px] w-[18px] text-muted" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block ${open ? "text-ink" : "text-muted"}`}>{l.title}</span>
                          <span className="text-sm text-muted">
                            {l.type === "article" && l.has_video ? "Video + reading" : TYPE_LABEL[l.type]} · {formatDuration(l.duration_sec)}
                          </span>
                        </span>
                        {!enrolled && l.is_preview && <span className="text-sm font-semibold text-brand">Preview</span>}
                        {!open && <LockIcon className="h-4 w-4 text-muted" title="Enroll to unlock" />}
                      </>
                    )
                    return (
                      <li key={l.id}>
                        {open ? (
                          <Link href={`/learn/${slug}/${l.id}`} className="-mx-2 flex items-center gap-3 rounded px-2 py-2 hover:bg-brand-50">
                            {row}
                          </Link>
                        ) : (
                          <div className="-mx-2 flex items-center gap-3 px-2 py-2">{row}</div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>
            </details>
          </li>
        )
      })}
    </ol>
  )
}
