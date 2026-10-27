"use client"

import Link from "next/link"
import { useState } from "react"
import type { AdminStudent } from "@/lib/admin"
import { Bar, StatusBadge, fmtDate, initials, timeAgo } from "@/app/admin/_components/ui"

type Filter = "all" | "active" | "completed" | "not-started"

export function StudentsTable({ students }: { students: AdminStudent[] }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [open, setOpen] = useState<string | null>(null)

  const [weekAgo] = useState(() => Date.now() - 7 * 86400_000)
  const list = students.filter((s) => {
    const q = query.trim().toLowerCase()
    if (q && !`${s.fullName} ${s.email}`.toLowerCase().includes(q)) return false
    if (filter === "active") return s.lastActivityAt ? new Date(s.lastActivityAt).getTime() > weekAgo : false
    if (filter === "completed") return s.courses.some((c) => c.status === "completed")
    if (filter === "not-started") return s.courses.length === 0
    return true
  })

  const filters: [Filter, string][] = [
    ["all", "All"],
    ["active", "Active this week"],
    ["completed", "Completed a course"],
    ["not-started", "Not enrolled yet"],
  ]

  return (
    <div className="card mt-8 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <label htmlFor="student-search" className="sr-only">
          Search students
        </label>
        <input
          id="student-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="field min-h-10 max-w-xs py-2"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter students">
          {filters.map(([key, label]) => (
            <button key={key} type="button" onClick={() => setFilter(key)} aria-current={filter === key ? "true" : undefined} className="chip !py-1.5 text-sm">
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-muted">
          {list.length} of {students.length}
        </span>
      </div>

      {list.length === 0 ? (
        <p className="px-5 py-12 text-center text-muted">{students.length ? "No students match." : "No students have signed up yet."}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[0.95rem]">
            <thead className="bg-soft text-xs font-bold uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Joined</th>
                <th className="px-3 py-3">Last active</th>
                <th className="px-3 py-3 text-right">Courses</th>
                <th className="px-3 py-3 text-right">Certificates</th>
                <th className="px-3 py-3">Overall progress</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((s) => {
                const done = s.courses.reduce((n, c) => n + c.done, 0)
                const total = s.courses.reduce((n, c) => n + c.total, 0)
                const expanded = open === s.id
                return (
                  <FragmentRow key={s.id}>
                    <tr className="border-t border-line hover:bg-brand-50/40">
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2f7bff] to-[#0041a8] text-xs font-bold text-white">
                            {initials(s.fullName || s.email)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">{s.fullName || "—"}</span>
                            <span className="block truncate text-sm text-muted">{s.email}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {s.status === "suspended" ? (
                          <StatusBadge status="suspended" />
                        ) : (
                          <span className="text-sm capitalize text-muted">{s.role}</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-sm text-muted">{fmtDate(s.joinedAt)}</td>
                      <td className="px-3 py-3.5 text-sm text-muted">{timeAgo(s.lastActivityAt ?? s.lastSignInAt)}</td>
                      <td className="px-3 py-3.5 text-right tabular-nums">{s.courses.length}</td>
                      <td className="px-3 py-3.5 text-right tabular-nums">{s.certificates}</td>
                      <td className="px-3 py-3.5">{total ? <Bar pct={(done / total) * 100} /> : <span className="text-sm text-muted">Not enrolled</span>}</td>
                      <td className="px-5 py-3.5 text-right">
                        {s.courses.length > 0 && (
                          <button type="button" onClick={() => setOpen(expanded ? null : s.id)} aria-expanded={expanded} className="link text-sm">
                            {expanded ? "Hide" : "Details"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-soft">
                        <td colSpan={8} className="px-5 pb-5 pt-1">
                          <ul className="grid gap-3 pt-3 md:grid-cols-2">
                            {s.courses.map((c) => (
                              <li key={c.slug} className="rounded-xl border border-line bg-white p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <Link href={`/courses/${c.slug}`} className="font-semibold hover:text-brand">
                                    {c.title}
                                  </Link>
                                  <StatusBadge status={c.status} />
                                </div>
                                <div className="mt-3">
                                  <Bar pct={c.total ? (c.done / c.total) * 100 : 0} />
                                </div>
                                <p className="mt-2 text-sm text-muted">
                                  {c.done} of {c.total} sections · enrolled {fmtDate(c.enrolled_at)}
                                  {c.completed_at ? ` · finished ${fmtDate(c.completed_at)}` : ` · last active ${timeAgo(c.last_activity_at)}`}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </FragmentRow>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
