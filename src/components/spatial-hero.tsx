"use client"

import { useEffect, useRef } from "react"
import { CourseCover } from "@/components/course-cover"
import { CheckIcon, PlayIcon } from "@/components/icons"

/**
 * Spatial (Vision-style) hero art: layers sit at different depths and the whole
 * scene tilts toward the pointer, with a light glare sweeping across glass panels.
 * Falls back to a still image when the user prefers reduced motion.
 */
export function SpatialHero() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return

    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let raf = 0

    const onMove = (e: PointerEvent) => {
      const r = scene.getBoundingClientRect()
      // normalise to -1..1 around the scene centre, with a generous reach across the hero
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)))
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)))
    }
    const onLeave = () => {
      tx = 0
      ty = 0
    }
    const tick = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      scene.style.setProperty("--rx", `${(-y * 12).toFixed(2)}deg`)
      scene.style.setProperty("--ry", `${(x * 16).toFixed(2)}deg`)
      scene.style.setProperty("--gx", `${(50 + x * 40).toFixed(1)}%`)
      scene.style.setProperty("--gy", `${(40 + y * 40).toFixed(1)}%`)
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="spatial-stage relative mx-auto aspect-square w-full max-w-[30rem]" aria-hidden="true">
      <div ref={sceneRef} className="spatial-scene absolute inset-0">
        {/* back layers */}
        <Layer z={-90} delay={0} className="right-0 top-0 h-[42%] w-[42%]">
          <div className="spatial-float-c h-full w-full rounded-full bg-gradient-to-br from-[#8fbaff] via-[#2f7bff] to-[#0041a8] shadow-[0_30px_80px_-20px_rgb(0_86_210/0.6)]" />
        </Layer>
        <Layer z={-50} delay={80} className="bottom-[6%] left-0 h-[30%] w-[30%]">
          <div className="spatial-float-b h-full w-full rounded-full bg-gradient-to-br from-[#e4eeff] to-[#c7dbff] ring-1 ring-white" />
        </Layer>

        {/* soft depth shadow under the globe */}
        <Layer z={-20} delay={120} className="inset-[12%]">
          <div className="h-full w-full translate-y-6 rounded-full bg-brand/25 blur-3xl" />
        </Layer>

        {/* main globe: a real study photo, with the course-art pattern underneath as a fallback */}
        <Layer z={0} delay={160} className="inset-[9%]">
          <div className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-white bg-[#0b2a66] shadow-[0_40px_80px_-20px_rgb(0_65_168/0.55),0_0_0_1px_rgb(0_86_210/0.15)]">
            <div className="absolute inset-0">
              <CourseCover motif="network" tone="lapis" seed="home-hero" rounded={false} />
            </div>
            {/* Photo: Wes Hicks on Unsplash (free to use under the Unsplash License) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&h=900&q=70"
              alt=""
              loading="eager"
              decoding="async"
              draggable={false}
              className="spatial-photo absolute inset-0 h-full w-full object-cover"
            />
            {/* brand tint so the photo sits with the blue theme */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[#0041a8]/60 via-[#0056d2]/10 to-transparent" />
            {/* glass sheen that follows the pointer */}
            <div className="spatial-glare absolute inset-0 rounded-full" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgb(0_30_90/0.25)]" />
          </div>
        </Layer>

        {/* orbit ring with travelling light */}
        <Layer z={30} delay={240} className="inset-[2%]">
          <div className="h-full w-full [transform:rotateX(74deg)_rotateZ(-18deg)] [transform-style:preserve-3d]">
            <div className="absolute inset-0 rounded-full border border-brand/30" />
            <div className="spatial-orbit absolute inset-0">
              <span className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2f7bff] shadow-[0_0_18px_6px_rgb(47_123_255/0.55)]" />
            </div>
          </div>
        </Layer>

        {/* floating glass panels */}
        <Layer z={120} delay={360} className="left-[3%] top-[14%] sm:-left-6">
          <div className="spatial-float-a spatial-glass flex items-center gap-3 rounded-2xl px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white shadow-[0_6px_16px_rgb(27_125_79/0.45)]">
              <CheckIcon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Lesson complete</span>
              <span className="block text-xs text-muted">Gradient descent</span>
            </span>
          </div>
        </Layer>

        <Layer z={80} delay={440} className="right-[4%] top-[38%]">
          <div className="spatial-float-c spatial-glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
              <PlayIcon className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold">Up next · 21 min</span>
          </div>
        </Layer>

        {/* floating photo card: taking notes */}
        <Layer z={100} delay={600} className="left-0 top-[40%] sm:-left-10 sm:bottom-[18%] sm:top-auto">
          <div className="spatial-float-c spatial-glass w-28 rounded-2xl p-1.5 sm:w-44">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-brand-100">
              {/* Photo: Quilia on Unsplash (free to use under the Unsplash License) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1522881451255-f59ad836fdfb?auto=format&fit=crop&w=400&h=300&q=70"
                alt=""
                loading="eager"
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="block px-1.5 pb-0.5 pt-1.5 text-xs font-semibold">
              Study notes<span className="hidden sm:inline"> · Week 3</span>
            </span>
          </div>
        </Layer>

        <Layer z={150} delay={520} className="right-[3%] bottom-[10%] sm:-right-4">
          <div className="spatial-float-b spatial-glass w-48 rounded-2xl sm:w-56 px-4 py-3">
            <span className="block text-sm font-semibold">Linear algebra</span>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-brand-100">
              <span className="spatial-fill block h-full rounded-full bg-gradient-to-r from-[#0056d2] to-[#5aa2ff]" />
            </span>
            <span className="mt-1.5 block text-xs text-muted">64% complete</span>
          </div>
        </Layer>
      </div>
    </div>
  )
}

/** One depth plane in the scene. `z` is its distance toward the viewer in px. */
function Layer({ z, delay, className, children }: { z: number; delay: number; className: string; children: React.ReactNode }) {
  return (
    <div className={`spatial-layer absolute ${className}`} style={{ "--z": `${z}px` } as React.CSSProperties}>
      <div className="spatial-in h-full w-full" style={{ animationDelay: `${delay}ms` }}>
        {children}
      </div>
    </div>
  )
}
