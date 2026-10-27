"use client"

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const config = error.message.includes("Missing Supabase settings")
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-24 sm:px-6">
      <h1 className="h-display !text-[clamp(1.8rem,1.4rem+1.5vw,2.4rem)]">{config ? "Veyro isn't connected to its database yet" : "Something went wrong loading this page"}</h1>
      <p className="mt-4 text-lg text-muted">
        {config
          ? "Add your Supabase URL and publishable key to .env.local, then restart the dev server."
          : "This is usually a temporary connection problem. Try again, and if it keeps happening, reload the page."}
      </p>
      {error.digest && <p className="mt-4 text-sm text-muted">Reference: {error.digest}</p>}
      <button type="button" onClick={reset} className="btn btn-primary mt-8">
        Try again
      </button>
    </div>
  )
}
