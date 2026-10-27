import Link from "next/link"
import { Suspense } from "react"
import { ChevronIcon, SearchIcon } from "@/components/icons"
import { getCurrentUser, firstName } from "@/lib/auth"
import { listCategories } from "@/lib/data"

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="veyro-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f7bff" />
          <stop offset="1" stopColor="#0041a8" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="32" height="32" rx="9" fill="url(#veyro-mark-bg)" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="#fff" strokeOpacity="0.18" />
      <path d="M9 10.5l7 12 7-12" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Wordmark({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className={`font-display text-[1.5rem] font-[800] leading-none tracking-[-0.04em] ${light ? "text-white" : "text-ink"}`}>
        veyro
      </span>
    </span>
  )
}

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-40 print:hidden border-b border-line/70 bg-white/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:gap-6">
        <Link href="/" aria-label="Veyro home" className="shrink-0 rounded">
          <Wordmark />
        </Link>

        <details className="group relative hidden md:block">
          <summary className="btn min-h-10 cursor-pointer list-none rounded-xl px-3.5 py-2 font-semibold text-ink hover:bg-brand-50 hover:text-brand group-open:bg-brand-50 group-open:text-brand [&::-webkit-details-marker]:hidden">
            Explore
            <ChevronIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
          </summary>
          <div className="absolute left-0 z-50 mt-2 w-72 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_48px_-16px_rgb(0_65_168/0.28)]">
            <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Explore by subject</p>
            <Suspense fallback={<div className="h-24" />}>
              <ExploreLinks />
            </Suspense>
            <div className="my-1 border-t border-line" />
            <Link href="/courses" className="block rounded-lg px-3 py-2 font-semibold text-brand hover:bg-brand-50">
              Browse all courses
            </Link>
          </div>
        </details>

        <form action="/courses" method="get" role="search" className="relative hidden max-w-xl flex-1 md:block">
          <label htmlFor="header-search" className="sr-only">
            Search courses
          </label>
          <input
            id="header-search"
            name="q"
            type="search"
            placeholder="What do you want to learn?"
            maxLength={100}
            className="field min-h-12 rounded-full border-line bg-[#f6f7f9] pl-6 pr-14 hover:bg-white focus-visible:bg-white"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-white shadow-[0_4px_12px_-4px_rgb(10_31_68/0.6)] transition-colors hover:bg-brand"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link href="/courses" aria-label="Search courses" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-soft md:hidden">
            <SearchIcon className="h-5 w-5" />
          </Link>
          <Suspense fallback={<div className="h-10 w-44" aria-hidden="true" />}>
            <UserNav />
          </Suspense>
        </div>
      </div>
    </header>
  )
}

async function ExploreLinks() {
  const categories = await listCategories()
  return (
    <ul>
      {categories.map((c) => (
        <li key={c.slug}>
          <Link href={`/courses?category=${c.slug}`} className="block rounded-lg px-3 py-2 font-medium hover:bg-brand-50 hover:text-brand">
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

async function UserNav() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <>
        <Link href="/sign-in" className="rounded-xl px-3 py-2 font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand">
          Log In
        </Link>
        <Link href="/sign-up" className="btn btn-primary hidden min-h-12 px-7 py-2 sm:inline-flex">
          Join for Free
        </Link>
      </>
    )
  }

  const name = user.fullName || user.email
  const initials =
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]!.toUpperCase())
      .join("") || "?"

  return (
    <>
      {user.role === "admin" && (
        <Link href="/admin" className="hidden items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 font-semibold text-brand transition-colors hover:bg-brand-100 sm:flex">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
            <path d="M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1z" />
          </svg>
          Admin
        </Link>
      )}
      <Link href="/my-learning" className="hidden rounded-xl px-3 py-2 font-semibold text-ink transition-colors hover:bg-brand-50 hover:text-brand sm:block">
        My Learning
      </Link>
      <details className="group relative">
        <summary
          className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-gradient-to-br from-[#2f7bff] to-[#0041a8] text-sm font-bold text-white ring-2 ring-white shadow-[0_6px_16px_-6px_rgb(0_86_210/0.7)] [&::-webkit-details-marker]:hidden"
          aria-label={`Account menu for ${name}`}
        >
          {initials}
        </summary>
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_24px_48px_-16px_rgb(0_65_168/0.28)]">
          <div className="px-3 py-2">
            <p className="font-semibold">{firstName(user)}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
          <div className="my-1 border-t border-line" />
          <Link href="/my-learning" className="block rounded px-3 py-2 hover:bg-soft">
            My Learning
          </Link>
          <Link href="/certificates" className="block rounded px-3 py-2 hover:bg-soft">
            My certificates
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" className="block rounded px-3 py-2 font-semibold text-brand hover:bg-brand-50">
              Admin dashboard
            </Link>
          )}
          <Link href="/account" className="block rounded px-3 py-2 hover:bg-soft">
            Settings
          </Link>
          <form action="/auth/sign-out" method="post">
            <button type="submit" className="block w-full rounded px-3 py-2 text-left hover:bg-soft">
              Log Out
            </button>
          </form>
        </div>
      </details>
    </>
  )
}

const FOOTER = [
  {
    title: "Subjects",
    links: [
      ["/courses?category=mindset", "Mindset"],
      ["/courses?category=marketing", "Marketing"],
      ["/courses?category=editing", "Editing"],
      ["/courses?category=coding", "Coding"],
      ["/courses", "All courses"],
    ],
  },
  {
    title: "Veyro",
    links: [
      ["/#mission", "About us"],
      ["/#services", "What we offer"],
      ["/#roadmap", "What we're building"],
      ["/#roadmap", "Teach on Veyro"],
    ],
  },
  {
    title: "Learners",
    links: [
      ["/sign-up", "Join for free"],
      ["/sign-in", "Log in"],
      ["/my-learning", "My Learning"],
      ["/certificates", "My certificates"],
      ["/account", "Account settings"],
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="site-footer surface-midnight mt-24 print:hidden">
      <div className="hairline-blue" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div>
          <Wordmark light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Structured courses in mindset, marketing, editing and coding, with practice in every class and a certificate when you finish.
          </p>
        </div>
        {FOOTER.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map(([href, label]) => (
                <li key={label}>
                  <Link href={href} className="text-white/65 transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="relative border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-sm text-white/45 sm:px-6">
          © {COPYRIGHT_YEAR} Veyro. All course content is original Veyro material.
        </p>
      </div>
    </footer>
  )
}

const COPYRIGHT_YEAR = 2026
