"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { CourseCover } from "@/components/course-cover"
import { AwardIcon, CheckIcon, ChevronIcon, TargetIcon } from "@/components/icons"

const INTERVAL_MS = 7000

type Slide = {
  id: string
  label: string
  render: () => React.ReactNode
}

const SLIDES: Slide[] = [
  {
    id: "welcome",
    label: "Learn skills that last",
    render: () => (
      <div className="grid h-full items-center gap-10 bg-brand-50 px-6 py-10 sm:px-12 md:px-20 lg:grid-cols-2 lg:py-12">
        <div>
          <h2 className="h-display max-w-[13ch]">Learn skills that last, at your own pace</h2>
          <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-[#3d4452]">
            Structured courses built around the clearest lectures, with notes, practice and progress saved on every lesson.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/sign-up" className="btn btn-primary btn-lg">
              Join for Free
            </Link>
            <Link href="/courses" className="btn btn-outline btn-lg">
              Explore courses
            </Link>
          </div>
        </div>
        <div className="relative mx-auto hidden aspect-square w-full max-w-[22rem] lg:block" aria-hidden="true">
          <div className="absolute right-0 top-0 h-[42%] w-[42%] rounded-full bg-[#ffd166]" />
          <div className="absolute bottom-[6%] left-0 h-[30%] w-[30%] rounded-full bg-brand-100" />
          <div className="absolute inset-[9%] overflow-hidden rounded-full border-8 border-white shadow-[0_20px_50px_rgb(0_86_210/0.25)]">
            <CourseCover motif="network" tone="lapis" seed="home-hero" rounded={false} className="scale-150" instance="banner" />
          </div>
          <div className="card absolute -left-6 top-[14%] flex items-center gap-3 px-4 py-3 shadow-[0_10px_30px_rgb(31_31_31/0.15)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-white">
              <CheckIcon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Lesson complete</span>
              <span className="block text-xs text-muted">Gradient descent</span>
            </span>
          </div>
          <div className="card absolute -right-4 bottom-[12%] w-52 px-4 py-3 shadow-[0_10px_30px_rgb(31_31_31/0.15)]">
            <span className="block text-sm font-semibold">Linear algebra</span>
            <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#e5e9f0]">
              <span className="block h-full w-[64%] rounded-full bg-brand" />
            </span>
            <span className="mt-1.5 block text-xs text-muted">64% complete</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "neural-networks",
    label: "New course: Neural networks, visually",
    render: () => (
      <div className="relative grid h-full items-center gap-10 overflow-hidden bg-[#0b1a3a] px-6 py-10 text-white sm:px-12 md:px-20 lg:grid-cols-2 lg:py-12">
        <div aria-hidden="true" className="absolute -left-20 -top-28 h-72 w-72 rounded-full bg-[#1a3b8f]/60" />
        <div className="relative">
          <span className="inline-block rounded bg-[#ffd166] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#3a2a00]">New course</span>
          <h2 className="h-display mt-4 max-w-[14ch]">Neural networks, visually</h2>
          <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-white/85">
            See how a network turns pixels into a guess — and how it learns to guess better. Four lectures, two modules, all free.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/courses/neural-networks-visually" className="btn btn-white btn-lg">
              Start the course
            </Link>
            <Link href="/courses?category=data-ai" className="btn btn-lg border border-white/50 text-white hover:bg-white/10">
              More in Data &amp; AI
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="overflow-hidden rounded-xl border-4 border-white/15 shadow-[0_24px_60px_rgb(0_0_0/0.45)]">
            <div className="aspect-[16/10]">
              <CourseCover motif="network" tone="ink" seed="neural-networks-visually" rounded={false} instance="banner" />
            </div>
          </div>
          <div className="absolute -bottom-4 left-6 flex gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink shadow">6 lessons</span>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-ink shadow">Intermediate</span>
            <span className="rounded-full bg-[#ffd166] px-3 py-1 text-sm font-semibold text-[#3a2a00] shadow">Free</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "coming-soon",
    label: "Quizzes and certificates are coming",
    render: () => (
      <div className="relative grid h-full items-center gap-10 overflow-hidden bg-[#fff4d6] px-6 py-10 sm:px-12 md:px-20 lg:grid-cols-2 lg:py-12">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#ffd166]/50" />
        <div className="relative">
          <span className="inline-block rounded bg-ink px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">Coming soon</span>
          <h2 className="h-display mt-4 max-w-[15ch]">Quizzes and certificates are on the way</h2>
          <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-[#4a3d1c]">
            Soon you&rsquo;ll be able to test what you&rsquo;ve learned and earn a shareable certificate. Create your account now so
            you&rsquo;re ready when they launch.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/sign-up" className="btn btn-primary btn-lg">
              Join for Free
            </Link>
            <Link href="/#roadmap" className="btn btn-outline btn-lg">
              See our roadmap
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block" aria-hidden="true">
          <div className="mx-auto max-w-sm rotate-[-3deg] rounded-xl border border-[#e8d9a8] bg-white p-7 shadow-[0_24px_60px_rgb(122_83_0/0.2)]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-brand">veyro</span>
              <AwardIcon className="h-8 w-8 text-[#c99a1b]" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted">Certificate of completion</p>
            <p className="mt-2 text-xl font-semibold">Your name here</p>
            <div className="mt-4 h-2 w-3/4 rounded bg-soft" />
            <div className="mt-2 h-2 w-1/2 rounded bg-soft" />
            <div className="mt-6 flex items-center gap-2 text-sm text-muted">
              <TargetIcon className="h-4 w-4" /> Verified course completion
            </div>
          </div>
        </div>
      </div>
    ),
  },
]

/** Rotating promo banners at the top of the home page. */
export function HeroCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useRef(false)

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  const go = useCallback((i: number) => setIndex((i + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused || reduceMotion.current) return
    const t = window.setTimeout(() => go(index + 1), INTERVAL_MS)
    return () => window.clearTimeout(t)
  }, [index, paused, go])

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-line">
        <div className="grid">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${SLIDES.length}: ${s.label}`}
              aria-hidden={i !== index}
              inert={i !== index}
              className={`[grid-area:1/1] transition-opacity duration-700 ease-out ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              {s.render()}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous banner"
          className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 shadow-md hover:bg-white md:flex"
        >
          <ChevronIcon className="h-5 w-5 rotate-90" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next banner"
          className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white/95 shadow-md hover:bg-white md:flex"
        >
          <ChevronIcon className="h-5 w-5 -rotate-90" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show banner ${i + 1}: ${s.label}`}
            aria-current={i === index ? "true" : undefined}
            className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-brand" : "w-2.5 bg-[#c4cfe0] hover:bg-[#9aa8bf]"}`}
          />
        ))}
      </div>
    </section>
  )
}
