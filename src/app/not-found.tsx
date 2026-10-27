import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-24 sm:px-6">
      <p className="text-6xl font-bold text-brand">404</p>
      <h1 className="h-display mt-2 !text-[clamp(1.8rem,1.4rem+1.5vw,2.4rem)]">We couldn&rsquo;t find that page.</h1>
      <p className="mt-4 text-lg text-muted">
        The link may be out of date, or the course may no longer be published.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/courses" className="btn btn-primary">
          Browse courses
        </Link>
        <Link href="/" className="btn btn-outline">
          Go to the home page
        </Link>
      </div>
    </div>
  )
}
