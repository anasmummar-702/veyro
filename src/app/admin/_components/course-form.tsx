"use client"

import { useActionState, useState } from "react"
import { CourseCover } from "@/components/course-cover"
import { FormError, SubmitButton } from "@/components/form-bits"
import type { CoverMotif, CoverTone } from "@/lib/data"
import { slugify } from "@/lib/format"
import { saveCourse, type AdminState } from "../actions"

const MOTIFS: CoverMotif[] = ["grid", "network", "curve", "lines", "orbit"]
const TONES: { value: CoverTone; label: string; swatch: string }[] = [
  { value: "lapis", label: "Royal blue", swatch: "#1f6ff0" },
  { value: "ink", label: "Deep blue", swatch: "#1c3f99" },
  { value: "moss", label: "Teal", swatch: "#0a7fa8" },
  { value: "plum", label: "Indigo", swatch: "#4b4fd8" },
  { value: "rust", label: "Sky", swatch: "#2a86ff" },
]

export type CourseFormValues = {
  id?: string
  title: string
  slug: string
  subtitle: string
  description: string
  outcomes: string[]
  level: "beginner" | "intermediate" | "advanced"
  categorySlug: string | null
  coverMotif: CoverMotif
  coverTone: CoverTone
  status: "draft" | "published" | "archived"
}

export const EMPTY_COURSE: CourseFormValues = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  outcomes: [],
  level: "beginner",
  categorySlug: null,
  coverMotif: "grid",
  coverTone: "lapis",
  status: "draft",
}

export function CourseForm({ initial, categories }: { initial: CourseFormValues; categories: { slug: string; name: string }[] }) {
  const [state, action] = useActionState<AdminState, FormData>(saveCourse, {})
  const isNew = !initial.id
  const [title, setTitle] = useState(initial.title)
  const [slug, setSlug] = useState(initial.slug)
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [motif, setMotif] = useState(initial.coverMotif)
  const [tone, setTone] = useState(initial.coverTone)
  const fe = state.fieldErrors ?? {}

  return (
    <form action={action} className="space-y-6" noValidate>
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <FormError message={state.error} />
      {state.ok && (
        <p role="status" className="rounded-md border border-success/30 bg-success-50 px-3 py-2.5 text-sm font-semibold text-success">
          {state.ok}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-5">
          <Text label="Course title" name="title" error={fe.title} value={title} onChange={(v) => {
            setTitle(v)
            if (!slugTouched) setSlug(slugify(v))
          }} placeholder="e.g. Photography: from phone to pro" required />
          <div>
            <label htmlFor="f-slug" className="field-label">
              Web address
            </label>
            <div className={`flex items-stretch overflow-hidden rounded-[0.75rem] border bg-white focus-within:border-brand focus-within:shadow-[0_0_0_4px_rgb(0_86_210/0.15)] ${fe.slug ? "border-danger" : "border-[#cfd8e6]"}`}>
              <span className="flex items-center bg-soft px-3 text-sm text-muted">/courses/</span>
              <input
                id="f-slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setSlug(e.target.value.toLowerCase())
                }}
                className="min-h-[2.9rem] flex-1 px-3 outline-none"
                placeholder="photography-basics"
              />
            </div>
            {fe.slug ? <p className="mt-1.5 text-sm font-medium text-danger">{fe.slug}</p> : <p className="mt-1.5 text-sm text-muted">Filled in from the title. Lowercase letters, numbers and dashes.</p>}
          </div>
          <Text label="Subtitle" name="subtitle" error={fe.subtitle} defaultValue={initial.subtitle} placeholder="One sentence on what learners will get" />
          <Area label="Description" name="description" error={fe.description} defaultValue={initial.description} rows={5} hint="Shown on the course page. Leave a blank line between paragraphs." />
          <Area
            label="What learners will learn"
            name="outcomes"
            error={fe.outcomes}
            defaultValue={initial.outcomes.join("\n")}
            rows={5}
            hint="One outcome per line (up to 12)."
            placeholder={"Edit a video from start to finish\nMix dialogue and music cleanly"}
          />
        </div>

        <div className="space-y-5">
          <div>
            <span className="field-label">Cover</span>
            <div className="overflow-hidden rounded-xl ring-1 ring-line">
              <div className="aspect-[16/9]">
                <CourseCover motif={motif} tone={tone} seed={slug || "new-course"} rounded={false} instance="preview" />
              </div>
            </div>
            <fieldset className="mt-3">
              <legend className="sr-only">Pattern</legend>
              <div className="grid grid-cols-5 gap-2">
                {MOTIFS.map((m) => (
                  <label key={m} className={`cursor-pointer overflow-hidden rounded-lg ring-2 ${motif === m ? "ring-brand" : "ring-transparent hover:ring-brand-200"}`}>
                    <input type="radio" name="coverMotif" value={m} checked={motif === m} onChange={() => setMotif(m)} className="sr-only" />
                    <span className="block aspect-square">
                      <CourseCover motif={m} tone={tone} seed={`pick-${m}`} rounded={false} instance={`pick-${m}`} />
                    </span>
                    <span className="sr-only">{m} pattern</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-3">
              <legend className="sr-only">Colour</legend>
              <div className="flex gap-2">
                {TONES.map((t) => (
                  <label key={t.value} title={t.label} className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ring-2 ring-offset-2 ${tone === t.value ? "ring-brand" : "ring-transparent hover:ring-brand-200"}`} style={{ background: t.swatch }}>
                    <input type="radio" name="coverTone" value={t.value} checked={tone === t.value} onChange={() => setTone(t.value)} className="sr-only" />
                    <span className="sr-only">{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <Select label="Level" name="level" defaultValue={initial.level} options={[["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]]} />
          <div>
            <Select
              label="Subject"
              name="category"
              defaultValue={initial.categorySlug ?? ""}
              options={[["", "No subject"], ...categories.map((c) => [c.slug, c.name] as [string, string])]}
            />
            <input name="newCategory" placeholder="…or type a new subject" className={`field mt-2 min-h-10 py-2 text-[0.95rem] ${fe.newCategory ? "border-danger" : ""}`} aria-label="New subject" />
            {fe.newCategory && <p className="mt-1.5 text-sm font-medium text-danger">{fe.newCategory}</p>}
          </div>

          <fieldset>
            <legend className="field-label">Status</legend>
            <div className="grid gap-2">
              {(
                [
                  ["draft", "Draft", "Only admins can see it"],
                  ["published", "Published", "Visible to everyone"],
                  ["archived", "Archived", "Hidden; enrolled students keep their records"],
                ] as const
              ).map(([value, label, note]) => (
                <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-white p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-50">
                  <input type="radio" name="status" value={value} defaultChecked={initial.status === value} className="mt-1 accent-[#0056d2]" />
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="block text-sm text-muted">{note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <SubmitButton pendingLabel="Saving…" className="btn btn-primary">
          {isNew ? "Create course" : "Save course details"}
        </SubmitButton>
        {isNew && <p className="text-sm text-muted">Next you&rsquo;ll add modules and sections.</p>}
      </div>
    </form>
  )
}

function Text({
  label,
  name,
  error,
  value,
  onChange,
  ...rest
}: {
  label: string
  name: string
  error?: string
  value?: string
  onChange?: (v: string) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <input
        id={`f-${name}`}
        name={name}
        {...(onChange ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value) } : {})}
        className={`field ${error ? "border-danger" : ""}`}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && <p className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}

function Area({ label, name, error, hint, ...rest }: { label: string; name: string; error?: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <textarea id={`f-${name}`} name={name} className={`field min-h-24 py-2.5 leading-relaxed ${error ? "border-danger" : ""}`} {...rest} />
      {error ? <p className="mt-1.5 text-sm font-medium text-danger">{error}</p> : hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
    </div>
  )
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: [string, string][]; defaultValue: string }) {
  return (
    <div>
      <label htmlFor={`f-${name}`} className="field-label">
        {label}
      </label>
      <select id={`f-${name}`} name={name} defaultValue={defaultValue} className="field">
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}
