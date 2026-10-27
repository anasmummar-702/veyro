/** Course completion bar. */
export function ProgressBar({
  done,
  total,
  label,
  className = "",
  size = "md",
}: {
  done: number
  total: number
  label?: string
  className?: string
  size?: "sm" | "md"
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return (
    <div className={className}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label ?? "Course progress"}
        className={`relative overflow-hidden rounded-full bg-brand-100 ${size === "sm" ? "h-1.5" : "h-2"}`}
      >
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0056d2] to-[#4b93ff] transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
