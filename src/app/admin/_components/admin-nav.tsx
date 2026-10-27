"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "M3 10.5 10 4l7 6.5V17a1 1 0 0 1-1 1h-3.5v-5h-5v5H4a1 1 0 0 1-1-1z", exact: true },
  { href: "/admin/courses", label: "Courses", icon: "M3 5.5A1.5 1.5 0 0 1 4.5 4H9l1.5 2h5A1.5 1.5 0 0 1 17 7.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5z" },
  { href: "/admin/students", label: "Students", icon: "M7.5 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 17a5.5 5.5 0 0 1 11 0M13.5 4.2a3 3 0 0 1 0 5.6M15.5 12.4A5.5 5.5 0 0 1 18 17" },
] as const

function Nav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:p-4">
      <p className="hidden px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted lg:block">Admin</p>
      {ITEMS.map((item) => {
        const active = "exact" in item && item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition-colors ${
              active ? "bg-brand text-white shadow-[0_8px_18px_-10px_rgb(0_86_210/0.8)]" : "text-ink hover:bg-brand-50 hover:text-brand"
            }`}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
              <path d={item.icon} />
            </svg>
            {item.label}
          </Link>
        )
      })}
      <Link href="/" className="mt-auto hidden shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:text-brand lg:flex">
        ← Back to site
      </Link>
    </nav>
  )
}

export function AdminNav() {
  return <Nav pathname={usePathname()} />
}

export function AdminNavFallback() {
  return <Nav pathname="" />
}
