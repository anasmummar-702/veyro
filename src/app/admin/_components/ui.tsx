import type { Enums } from "@/lib/database.types"

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(1.7rem,1.3rem+1.2vw,2.3rem)] font-bold tracking-[-0.03em] text-navy">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[60ch] text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}

const STATUS_STYLE: Record<string, string> = {
  published: "bg-success-50 text-success ring-success/20",
  draft: "bg-[#fff6e5] text-[#9a5b00] ring-[#f0c36b]/40",
  archived: "bg-soft text-muted ring-line",
  active: "bg-brand-50 text-brand ring-brand-200",
  completed: "bg-success-50 text-success ring-success/20",
  suspended: "bg-danger/5 text-danger ring-danger/20",
}

const STATUS_LABEL: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
  active: "In progress",
  completed: "Completed",
  suspended: "Suspended",
}

export function StatusBadge({ status }: { status: Enums<"course_status"> | Enums<"enrollment_status"> | string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${STATUS_STYLE[status] ?? STATUS_STYLE.archived}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function Bar({ pct }: { pct: number }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)))
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-brand-100">
        <span className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0056d2] to-[#4b93ff]" style={{ width: `${v}%` }} />
      </span>
      <span className="w-9 text-right text-sm tabular-nums text-muted">{v}%</span>
    </span>
  )
}

export function initials(name: string) {
  return (
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]!.toUpperCase())
      .join("") || "?"
  )
}

export function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })
}

export function timeAgo(iso: string | null | undefined) {
  if (!iso) return "Never"
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return "Just now"
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`
  return fmtDate(iso)
}
