"use client"

import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  pendingLabel,
  className = "btn btn-primary w-full",
}: {
  children: React.ReactNode
  pendingLabel: string
  className?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className={className} disabled={pending} aria-live="polite">
      {pending ? pendingLabel : children}
    </button>
  )
}

export function Field({
  label,
  name,
  type = "text",
  error,
  hint,
  ...rest
}: {
  label: string
  name: string
  type?: string
  error?: string
  hint?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "type">) {
  const id = `f-${name}`
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className={`field ${error ? "border-danger" : ""}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm font-medium text-danger">
      {message}
    </p>
  )
}
