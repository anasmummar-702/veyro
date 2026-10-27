"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import type { AdminModule } from "@/lib/admin"
import { formatDuration } from "@/lib/format"
import { parseYouTubeId } from "@/lib/youtube-id"
import { addModule, addSection, deleteModule, deleteSectionInline, moveModule, moveSection, setSectionVideo, updateModule, type AdminState } from "../actions"

export function CurriculumBuilder({ courseId, modules }: { courseId: string; modules: AdminModule[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<AdminState | null>(null)

  const run = (fn: () => Promise<AdminState>, after?: () => void) =>
    startTransition(async () => {
      const res = await fn()
      setMessage(res.error || res.ok ? res : null)
      if (!res.error) {
        after?.()
        router.refresh()
      }
    })

  return (
    <div className={pending ? "opacity-80 transition-opacity" : ""}>
      {message?.error && (
        <p role="alert" className="mb-4 rounded-md border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm font-medium text-danger">
          {message.error}
        </p>
      )}
      {message?.ok && (
        <p role="status" className="mb-4 rounded-md border border-success/30 bg-success-50 px-3 py-2.5 text-sm font-semibold text-success">
          {message.ok}
        </p>
      )}

      {modules.length === 0 && <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-muted">No modules yet. Add the first one below.</p>}

      <ol className="space-y-4">
        {modules.map((m, mi) => (
          <ModuleCard
            key={m.id}
            module={m}
            index={mi}
            count={modules.length}
            courseId={courseId}
            pending={pending}
            run={run}
          />
        ))}
      </ol>

      <AddModule disabled={pending} onAdd={(title, description, reset) => run(() => addModule(courseId, title, description), reset)} />
    </div>
  )
}

function ModuleCard({
  module: m,
  index,
  count,
  courseId,
  pending,
  run,
}: {
  module: AdminModule
  index: number
  count: number
  courseId: string
  pending: boolean
  run: (fn: () => Promise<AdminState>, after?: () => void) => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(m.title)
  const [description, setDescription] = useState(m.description ?? "")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [newSection, setNewSection] = useState("")
  const total = m.sections.reduce((s, l) => s + l.durationSec, 0)

  return (
    <li className="card overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 border-b border-line bg-white p-4 sm:p-5">
        <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand ring-1 ring-brand-100">{index + 1}</span>
        {editing ? (
          <form
            className="min-w-0 flex-1 space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              run(() => updateModule(m.id, title, description), () => setEditing(false))
            }}
          >
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="field min-h-10 py-2 font-semibold" aria-label="Module title" autoFocus />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="field py-2 text-[0.95rem]" placeholder="Short description (optional)" aria-label="Module description" />
            <div className="flex gap-2">
              <button type="submit" disabled={pending} className="btn btn-primary min-h-9 px-4 py-1.5 text-sm">
                Save module
              </button>
              <button type="button" onClick={() => setEditing(false)} className="btn btn-outline min-h-9 px-4 py-1.5 text-sm">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted">
              Module {index + 1} · {m.sections.length} {m.sections.length === 1 ? "section" : "sections"}
              {total > 0 && ` · ${formatDuration(total)}`}
            </p>
            <p className="text-lg font-bold leading-snug tracking-[-0.01em]">{m.title}</p>
            {m.description && <p className="mt-0.5 text-[0.95rem] text-muted">{m.description}</p>}
          </div>
        )}
        {!editing && (
          <div className="flex flex-wrap items-center gap-1.5">
            <IconButton label="Move module up" disabled={pending || index === 0} onClick={() => run(() => moveModule(m.id, -1))} path="M10 15V5M5 10l5-5 5 5" />
            <IconButton label="Move module down" disabled={pending || index === count - 1} onClick={() => run(() => moveModule(m.id, 1))} path="M10 5v10M5 10l5 5 5-5" />
            <button type="button" onClick={() => setEditing(true)} className="btn btn-outline min-h-9 px-3.5 py-1.5 text-sm">
              Edit
            </button>
            {confirmDelete ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteModule(m.id))}
                onBlur={() => setConfirmDelete(false)}
                className="btn min-h-9 border border-danger bg-danger px-3.5 py-1.5 text-sm text-white"
              >
                Delete module + {m.sections.length} sections?
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="btn min-h-9 border border-line bg-white px-3.5 py-1.5 text-sm text-danger hover:border-danger">
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <ol className="divide-y divide-line bg-white">
        {m.sections.map((s, si) => (
          <SectionRow key={s.id} section={s} index={si} count={m.sections.length} moduleIndex={index} courseId={courseId} pending={pending} run={run} />
        ))}
      </ol>

      <form
        className="flex flex-col gap-2 border-t border-line bg-soft p-3 sm:flex-row sm:p-4"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => addSection(m.id, courseId, newSection), () => setNewSection(""))
        }}
      >
        <label htmlFor={`new-section-${m.id}`} className="sr-only">
          New section title
        </label>
        <input
          id={`new-section-${m.id}`}
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          placeholder="New section title, e.g. “Lighting a scene”"
          className="field min-h-10 flex-1 py-2 text-[0.95rem]"
        />
        <button type="submit" disabled={pending || !newSection.trim()} className="btn btn-primary min-h-10 px-5 py-2 text-[0.95rem]">
          + Add section
        </button>
      </form>
    </li>
  )
}

function SectionRow({
  section: s,
  index,
  count,
  moduleIndex,
  courseId,
  pending,
  run,
}: {
  section: AdminModule["sections"][number]
  index: number
  count: number
  moduleIndex: number
  courseId: string
  pending: boolean
  run: (fn: () => Promise<AdminState>, after?: () => void) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  return (
    <li className="px-4 py-3 sm:px-5">
     <div className="flex flex-wrap items-center gap-3">
      <span className="w-10 shrink-0 text-sm tabular-nums text-muted">
        {moduleIndex + 1}.{index + 1}
      </span>
      <Link href={`/admin/courses/${courseId}/sections/${s.id}`} className="min-w-0 flex-1 font-semibold hover:text-brand">
        {s.title}
      </Link>
      <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setVideoOpen((v) => !v)}
          aria-expanded={videoOpen}
          className={
            s.videoRef
              ? "rounded-full bg-brand-50 px-2.5 py-1 text-brand ring-1 ring-brand-100 hover:bg-brand-100"
              : "rounded-full border border-dashed border-brand-200 bg-white px-2.5 py-1 text-brand hover:bg-brand-50"
          }
        >
          {s.videoRef ? "▶ Video" : "+ Add video"}
        </button>
        {s.isPreview && <span className="rounded-full bg-success-50 px-2 py-0.5 text-success ring-1 ring-success/20">Free preview</span>}
        <span className="px-1 font-medium text-muted">{formatDuration(s.durationSec)}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <IconButton label="Move section up" disabled={pending || index === 0} onClick={() => run(() => moveSection(s.id, -1))} path="M10 15V5M5 10l5-5 5 5" />
        <IconButton label="Move section down" disabled={pending || index === count - 1} onClick={() => run(() => moveSection(s.id, 1))} path="M10 5v10M5 10l5 5 5-5" />
        <Link href={`/admin/courses/${courseId}/sections/${s.id}`} className="btn btn-outline min-h-9 px-3.5 py-1.5 text-sm">
          Edit
        </Link>
        {confirmDelete ? (
          <button type="button" disabled={pending} onClick={() => run(() => deleteSectionInline(s.id))} onBlur={() => setConfirmDelete(false)} className="btn min-h-9 border border-danger bg-danger px-3 py-1.5 text-sm text-white">
            Confirm delete
          </button>
        ) : (
          <IconButton label="Delete section" onClick={() => setConfirmDelete(true)} danger path="M5 6h10M8 6V4.5h4V6M6.5 6l.7 9.5h5.6l.7-9.5" />
        )}
      </span>
     </div>
      {videoOpen && <VideoEditor key={s.videoRef ?? "none"} section={s} pending={pending} run={run} onDone={() => setVideoOpen(false)} />}
    </li>
  )
}

function VideoEditor({
  section: s,
  pending,
  run,
  onDone,
}: {
  section: AdminModule["sections"][number]
  pending: boolean
  run: (fn: () => Promise<AdminState>, after?: () => void) => void
  onDone: () => void
}) {
  const [link, setLink] = useState("")
  const id = link.trim() ? parseYouTubeId(link) : null
  const shown = id ?? s.videoRef
  return (
    <form
      className="mt-3 flex flex-col gap-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4 sm:flex-row sm:items-start"
      onSubmit={(e) => {
        e.preventDefault()
        if (id) run(() => setSectionVideo(s.id, link), onDone)
      }}
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-navy sm:w-44">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`https://i.ytimg.com/vi/${shown}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-xs font-semibold text-white/60">No video yet</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <label htmlFor={`video-${s.id}`} className="text-sm font-bold">
          {s.videoRef ? "Replace with another YouTube link" : "Paste a YouTube link"}
        </label>
        <input
          id={`video-${s.id}`}
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://youtu.be/…"
          inputMode="url"
          autoComplete="off"
          autoFocus
          className="field mt-1.5 min-h-10 py-2"
        />
        <p className="mt-1.5 min-h-5 text-xs text-muted">
          {link.trim() && !id ? <span className="font-semibold text-danger">That doesn&rsquo;t look like a YouTube link yet.</span> : "Learners see it at the top of this section, without YouTube's suggestions."}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="submit" disabled={pending || !id} className="btn btn-primary min-h-9 px-4 py-1.5 text-sm">
            {s.videoRef ? "Save new video" : "Add video"}
          </button>
          {s.videoRef && (
            <button type="button" disabled={pending} onClick={() => run(() => setSectionVideo(s.id, ""), onDone)} className="btn btn-outline min-h-9 px-4 py-1.5 text-sm text-danger">
              Remove video
            </button>
          )}
          <button type="button" onClick={onDone} className="min-h-9 px-3 py-1.5 text-sm font-semibold text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}

function AddModule({ disabled, onAdd }: { disabled: boolean; onAdd: (title: string, description: string, reset: () => void) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  return (
    <form
      className="mt-5 rounded-2xl border-2 border-dashed border-brand-200 bg-white p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault()
        onAdd(title, description, () => {
          setTitle("")
          setDescription("")
        })
      }}
    >
      <p className="font-bold">Add a module</p>
      <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Module title" aria-label="Module title" className="field min-h-10 py-2" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description (optional)" aria-label="Module description" className="field min-h-10 py-2" />
        <button type="submit" disabled={disabled || !title.trim()} className="btn btn-primary min-h-10 px-5 py-2">
          + Add module
        </button>
      </div>
    </form>
  )
}

function IconButton({ label, path, onClick, disabled, danger }: { label: string; path: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white transition-colors disabled:opacity-35 ${danger ? "text-danger hover:border-danger" : "text-ink hover:border-brand hover:text-brand"}`}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d={path} />
      </svg>
    </button>
  )
}
