"use client"

import { useEffect, useRef } from "react"

export type CountKind = "number" | "plus" | "duration"

const DURATION_MS = 1800

function group(n: number) {
  return Math.round(n).toLocaleString("en-US")
}

/** The value as [number, unit] pieces, so units can be drawn smaller than the numbers. */
function pieces(kind: CountKind, v: number): [string, string][] {
  if (kind === "plus") return [[group(v), "+"]]
  if (kind === "duration") {
    const totalMin = Math.round(v / 60)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    if (h === 0) return [[String(m), "min"]]
    return m ? [[String(h), "h"], [String(m), "min"]] : [[String(h), "h"]]
  }
  return [[group(v), ""]]
}

const UNIT_CLASS = "ml-[0.12em] mr-[0.28em] text-[0.55em] font-bold tracking-normal last:mr-0"

function toHtml(kind: CountKind, v: number) {
  return pieces(kind, v)
    .map(([n, unit]) => (unit ? `${n}<span class="${UNIT_CLASS}">${unit}</span>` : n))
    .join("")
}

/**
 * A number that counts up from zero the first time it scrolls into view.
 * The server renders the final value (so it's right without JavaScript and for search engines);
 * screen readers always get the final value.
 */
export function CountUp({ value, kind = "number", className = "" }: { value: number; kind?: CountKind; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || value <= 0) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let raf = 0
    el.innerHTML = toHtml(kind, 0)

    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / DURATION_MS)
        const eased = 1 - Math.pow(1 - p, 4)
        el.innerHTML = toHtml(kind, value * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.6 },
    )
    io.observe(el)

    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      el.innerHTML = toHtml(kind, value)
    }
  }, [value, kind])

  const label = pieces(kind, value)
    .map(([n, unit]) => (unit === "+" ? `more than ${n}` : unit ? `${n} ${unit === "h" ? "hours" : "minutes"}` : n))
    .join(" ")

  return (
    <span className={className}>
      <span className="sr-only">{label}</span>
      {/* Children are written as HTML so the animation can update them without React re-rendering. */}
      <span ref={ref} aria-hidden="true" className="tabular-nums" dangerouslySetInnerHTML={{ __html: toHtml(kind, value) }} />
    </span>
  )
}
