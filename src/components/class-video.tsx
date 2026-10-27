"use client"

import Link from "next/link"
import { VeyroPlayer } from "@/components/veyro-player"

/**
 * The video at the top of a class. Shows the video's cover until the learner presses
 * play, then plays it in Veyro's player. When it ends, Veyro's own panel replaces the
 * player, so learners aren't shown other videos.
 */
export function ClassVideo({
  videoRef,
  title,
  moduleLabel,
  nextHref,
}: {
  videoRef: string
  title: string
  moduleLabel: string
  nextHref: string | null
}) {
  return (
    <VeyroPlayer
      videoRef={videoRef}
      title={title}
      label={moduleLabel}
      className="class-video rounded-2xl shadow-[0_30px_60px_-30px_rgb(10_31_68/0.6)] ring-1 ring-navy/10"
      renderEnded={(replay) => (
        <>
          <p className="font-display text-2xl font-bold tracking-[-0.02em]">Video complete</p>
          <p className="mt-2 max-w-[42ch] text-white/75">Read the notes and try the exercise below, then mark the class as completed.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={replay} className="btn btn-ghost-light">
              Watch again
            </button>
            {nextHref && (
              <Link href={nextHref} className="btn btn-white">
                Next class
              </Link>
            )}
          </div>
        </>
      )}
      renderError={(message, retry) => (
        <>
          <p className="font-display text-xl font-bold tracking-[-0.02em]">Video unavailable</p>
          <p className="mt-2 max-w-[44ch] text-white/75">{message} The class notes below cover everything you need.</p>
          <button type="button" onClick={retry} className="btn btn-ghost-light mt-6">
            Try again
          </button>
        </>
      )}
    />
  )
}
