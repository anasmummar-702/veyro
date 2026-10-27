import { CourseCover } from "@/components/course-cover"
import { CheckIcon, PlayIcon, ReadIcon } from "@/components/icons"

const LESSONS = [
  { title: "How this course works", type: "read", done: true, time: "3 min" },
  { title: "But what is a neural network?", type: "video", done: true, time: "19 min" },
  { title: "Gradient descent, how neural networks learn", type: "video", done: false, current: true, time: "21 min" },
  { title: "Backpropagation, intuitively", type: "video", done: false, time: "13 min" },
  { title: "Backpropagation calculus", type: "video", done: false, time: "10 min" },
]

/** A stylised, non-interactive glimpse of the classroom for the home page hero. */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl [perspective:2000px]" aria-hidden="true">
      <div className="absolute -inset-x-10 -top-10 bottom-0 rounded-[40px] bg-gradient-to-b from-violet/25 via-indigo/10 to-transparent blur-3xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-panel/90 shadow-[0_40px_120px_-30px_rgb(99_102_241/0.55)] [transform:rotateX(9deg)] [transform-origin:top_center] motion-safe:animate-rise [animation-delay:350ms]">
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="mx-auto hidden truncate rounded-md bg-white/[0.04] px-3 py-1 font-mono text-[0.7rem] text-faint sm:inline">veyro.app/learn/neural-networks-visually</span>
        </div>
        <div className="grid md:grid-cols-[17rem_minmax(0,1fr)]">
          <div className="hidden border-r border-white/[0.06] p-3 md:block">
            <p className="px-2 pb-2 pt-1 text-xs font-medium text-faint">Neural networks, visually</p>
            <div className="mx-2 mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
              <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-violet via-indigo to-cyan shadow-[0_0_12px_rgb(139_92_246/0.8)]" />
            </div>
            {LESSONS.map((l) => (
              <div
                key={l.title}
                className={`flex items-start gap-2.5 rounded-lg px-2 py-2 text-[0.8rem] ${l.current ? "bg-violet/15 text-white ring-1 ring-violet/40" : "text-muted"}`}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {l.done ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-mint/20 text-mint">
                      <CheckIcon className="h-2.5 w-2.5" />
                    </span>
                  ) : l.type === "video" ? (
                    <PlayIcon className="h-4 w-4" />
                  ) : (
                    <ReadIcon className="h-4 w-4" />
                  )}
                </span>
                <span className="leading-snug">{l.title}</span>
              </div>
            ))}
          </div>
          <div className="p-4 sm:p-6">
            <p className="text-xs text-faint">Module 2: How networks learn</p>
            <p className="mt-1 text-lg font-[600] tracking-[-0.02em] text-white sm:text-xl">Gradient descent, how neural networks learn</p>
            <div className="relative mt-4 aspect-video overflow-hidden rounded-xl">
              <CourseCover motif="network" tone="ink" seed="hero-player" rounded={false} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md">
                  <svg viewBox="0 0 20 20" className="ml-1 h-6 w-6 fill-white">
                    <path d="M6 4l10 6-10 6z" />
                  </svg>
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-8 font-mono text-[0.7rem] text-white/80">
                <span>12:47</span>
                <span className="relative h-1 flex-1 rounded-full bg-white/20">
                  <span className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-white" />
                </span>
                <span>20:33</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <span className="h-1.5 w-28 overflow-hidden rounded-full bg-white/[0.07]">
                <span className="block h-full w-[73%] rounded-full bg-gradient-to-r from-violet to-cyan" />
              </span>
              Watched 12:47 of 20:33
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
