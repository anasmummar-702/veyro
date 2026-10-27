"use client"

import { useActionState, useLayoutEffect, useRef, useState, useTransition, type KeyboardEvent } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { FormError, SubmitButton } from "@/components/form-bits"
import { parseYouTubeId } from "@/lib/youtube-id"
import { applyEdit, continueList, insertBlock, toggleCode, toggleInline, toggleLines, type Edit } from "@/lib/markdown-format"
import { deleteSection, saveSection, type AdminState } from "../actions"

export type SectionFormValues = {
  id: string
  courseId: string
  title: string
  minutes: number
  isPreview: boolean
  videoRef: string | null
  bodyMd: string
}

type Format = (value: string, start: number, end: number) => Edit

const TOOLBAR: { label: string; title: string; run: Format }[] = [
  { label: "Heading", title: "Make the current line a heading", run: (v, s, e) => toggleLines(v, s, e, "heading") },
  { label: "Bold", title: "Bold the selection (Ctrl+B)", run: (v, s, e) => toggleInline(v, s, e, "**", "bold text") },
  { label: "Italic", title: "Italicise the selection (Ctrl+I)", run: (v, s, e) => toggleInline(v, s, e, "_", "italic text") },
  { label: "List", title: "Turn the selected lines into a bulleted list", run: (v, s, e) => toggleLines(v, s, e, "bullet") },
  { label: "Numbered", title: "Turn the selected lines into a numbered list", run: (v, s, e) => toggleLines(v, s, e, "numbered") },
  { label: "Quote", title: "Turn the selected lines into a quote", run: (v, s, e) => toggleLines(v, s, e, "quote") },
  { label: "Code", title: "Put the selected lines in a code block", run: toggleCode },
  {
    label: "Try this",
    title: "Add a practice task below the current line",
    run: (v, s, e) => insertBlock(v, s, e, "## Try this\n\nDescribe the practice task.", "Describe the practice task."),
  },
]

export function SectionForm({ initial }: { initial: SectionFormValues }) {
  const [state, action] = useActionState<AdminState, FormData>(saveSection, {})
  const [video, setVideo] = useState(initial.videoRef ? `https://youtu.be/${initial.videoRef}` : "")
  const [body, setBody] = useState(initial.bodyMd)
  const [tab, setTab] = useState<"write" | "preview">("write")
  const [confirm, setConfirm] = useState(false)
  const [deleting, startDelete] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pendingSelection = useRef<[number, number] | null>(null)
  const videoId = video.trim() ? parseYouTubeId(video) : null
  const fe = state.fieldErrors ?? {}

  // Restore the selection after React has re-rendered the textarea (fallback path below).
  useLayoutEffect(() => {
    const el = textareaRef.current
    const sel = pendingSelection.current
    if (!el || !sel) return
    pendingSelection.current = null
    el.focus()
    el.setSelectionRange(sel[0], sel[1])
  })

  const applyFormat = (format: Format) => {
    const el = textareaRef.current
    if (!el) return
    const value = el.value
    const edit = format(value, el.selectionStart, el.selectionEnd)
    const next = applyEdit(value, edit)

    // Replace only the changed range through the browser, so Ctrl+Z still undoes it.
    el.focus()
    el.setSelectionRange(edit.from, edit.to)
    let ok = false
    try {
      ok = edit.text ? document.execCommand("insertText", false, edit.text) : edit.from === edit.to || document.execCommand("delete")
    } catch {
      ok = false
    }
    if (ok && el.value === next) {
      el.setSelectionRange(edit.selStart, edit.selEnd)
      setBody(next)
    } else {
      pendingSelection.current = [edit.selStart, edit.selEnd]
      setBody(next)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return
    const mod = e.ctrlKey || e.metaKey
    if (mod && !e.shiftKey && !e.altKey && (e.key === "b" || e.key === "B")) {
      e.preventDefault()
      applyFormat((v, s, end) => toggleInline(v, s, end, "**", "bold text"))
    } else if (mod && !e.shiftKey && !e.altKey && (e.key === "i" || e.key === "I")) {
      e.preventDefault()
      applyFormat((v, s, end) => toggleInline(v, s, end, "_", "italic text"))
    } else if (e.key === "Enter" && !mod && !e.shiftKey && !e.altKey) {
      const el = e.currentTarget
      const edit = continueList(el.value, el.selectionStart, el.selectionEnd)
      if (edit) {
        e.preventDefault()
        applyFormat(() => edit)
      }
    }
  }

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="id" value={initial.id} />
      <input type="hidden" name="courseId" value={initial.courseId} />
      <FormError message={state.error} />
      {state.ok && (
        <p role="status" className="rounded-md border border-success/30 bg-success-50 px-3 py-2.5 text-sm font-semibold text-success">
          {state.ok}. Learners see the changes right away.
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_10rem]">
        <div>
          <label htmlFor="f-title" className="field-label">
            Section title
          </label>
          <input id="f-title" name="title" defaultValue={initial.title} className={`field ${fe.title ? "border-danger" : ""}`} required />
          {fe.title && <p className="mt-1.5 text-sm font-medium text-danger">{fe.title}</p>}
        </div>
        <div>
          <label htmlFor="f-minutes" className="field-label">
            Length (minutes)
          </label>
          <input id="f-minutes" name="minutes" type="number" min={1} max={720} defaultValue={initial.minutes} className={`field ${fe.minutes ? "border-danger" : ""}`} />
          {fe.minutes && <p className="mt-1.5 text-sm font-medium text-danger">{fe.minutes}</p>}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-4 has-[:checked]:border-brand has-[:checked]:bg-brand-50">
        <input type="checkbox" name="isPreview" defaultChecked={initial.isPreview} className="mt-1 h-4 w-4 accent-[#0056d2]" />
        <span>
          <span className="block font-semibold">Free preview</span>
          <span className="block text-sm text-muted">Anyone can open this section without signing up or enrolling.</span>
        </span>
      </label>

      <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <label htmlFor="f-video" className="field-label">
          Video (YouTube link)
        </label>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
          <div>
            <input
              id="f-video"
              name="video"
              value={video}
              onChange={(e) => setVideo(e.target.value)}
              placeholder="https://youtu.be/… — leave empty for no video"
              inputMode="url"
              autoComplete="off"
              className={`field ${fe.video ? "border-danger" : ""}`}
            />
            {fe.video ? (
              <p className="mt-1.5 text-sm font-medium text-danger">{fe.video}</p>
            ) : (
              <p className="mt-1.5 text-sm text-muted">
                {video.trim() && !videoId ? "That doesn't look like a YouTube link yet." : "The video plays at the top of the section, above the notes."}
              </p>
            )}
            {video && (
              <button type="button" onClick={() => setVideo("")} className="link mt-2 text-sm">
                Remove video
              </button>
            )}
          </div>
          <div className="aspect-video overflow-hidden rounded-lg bg-brand-50 ring-1 ring-line">
            {videoId ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt="Video preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-xs font-semibold text-muted">No video</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <label htmlFor="f-body" className="field-label !mb-0">
              Description and notes
            </label>
            <p className="text-sm text-muted">Shown under the video. Select text and use the buttons to format it, or write Markdown.</p>
          </div>
          <div className="flex rounded-full border border-line bg-white p-0.5 text-sm font-semibold" role="tablist" aria-label="Notes view">
            {(["write", "preview"] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 capitalize ${tab === t ? "bg-brand text-white" : "text-muted hover:text-ink"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 overflow-hidden rounded-xl border border-[#cfd8e6] bg-white">
          {tab === "write" ? (
            <>
              <div className="flex flex-wrap gap-1 border-b border-line bg-soft px-2 py-1.5" role="toolbar" aria-label="Formatting" aria-controls="f-body">
                {TOOLBAR.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    title={b.title}
                    // Keep focus (and the selection) in the textarea when a button is clicked.
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyFormat(b.run)}
                    className="rounded-md px-2.5 py-1 text-sm font-semibold text-ink hover:bg-white hover:text-brand"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <textarea
                id="f-body"
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={onKeyDown}
                rows={18}
                spellCheck
                className="block w-full resize-y px-4 py-3 font-mono text-[0.92rem] leading-relaxed outline-none"
                placeholder={"Introduce the section, explain the key ideas…\n\n## Try this\n\nA short practice task."}
              />
            </>
          ) : (
            <div className="prose-reading min-h-[24rem] px-5 py-4">
              {body.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown> : <p className="text-muted">Nothing written yet.</p>}
            </div>
          )}
        </div>
        <input type="hidden" name="body" value={body} />
        {fe.body && <p className="mt-1.5 text-sm font-medium text-danger">{fe.body}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <SubmitButton pendingLabel="Saving…" className="btn btn-primary">
          Save section
        </SubmitButton>
        <span className="ml-auto flex items-center gap-2">
          {confirm ? (
            <>
              <button
                type="button"
                disabled={deleting}
                onClick={() => startDelete(async () => void (await deleteSection(initial.id, initial.courseId)))}
                className="btn border border-danger bg-danger text-white"
              >
                {deleting ? "Deleting…" : "Yes, delete section"}
              </button>
              <button type="button" onClick={() => setConfirm(false)} className="btn btn-outline">
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="btn border border-danger/40 bg-white text-danger hover:border-danger">
              Delete section
            </button>
          )}
        </span>
      </div>
    </form>
  )
}
