"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { getBrowserClient } from "@/lib/supabase/client"
import { PlaybackTracker } from "@/lib/playback-tracker"
import { YT_STATE, type YTPlayer } from "@/lib/youtube"
import { formatClock } from "@/lib/format"
import { CheckIcon } from "@/components/icons"
import { VeyroPlayer } from "@/components/veyro-player"

const FLUSH_EVERY_MS = 10_000
const SAMPLE_EVERY_MS = 1_000
const COMPLETE_AT = 0.85

export function VideoLesson({
  lessonId,
  videoRef,
  title,
  label,
  durationSec,
  resumeAt,
  watchedSec: initialWatched,
  completed: initiallyCompleted,
  trackable,
  courseHref,
  nextHref,
}: {
  lessonId: string
  videoRef: string
  title: string
  label?: string
  durationSec: number
  resumeAt: number
  watchedSec: number
  completed: boolean
  trackable: boolean
  courseHref: string
  nextHref: string | null
}) {
  const router = useRouter()
  const playerRef = useRef<YTPlayer | null>(null)
  const playerDurationRef = useRef<number | undefined>(undefined)
  const trackerRef = useRef(new PlaybackTracker())
  const sendingRef = useRef(false)
  const sampleTimer = useRef<number | undefined>(undefined)
  const [watched, setWatched] = useState(initialWatched)
  const [completed, setCompleted] = useState(initiallyCompleted)
  const [ended, setEnded] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const flush = useCallback(async () => {
    if (!trackable || sendingRef.current) return
    const tracker = trackerRef.current
    const intervals = tracker.drain()
    if (!intervals.length) return
    sendingRef.current = true
    try {
      const { data, error } = await getBrowserClient().rpc("record_video_progress", {
        p_lesson_id: lessonId,
        p_intervals: intervals,
        p_position: tracker.position,
        p_player_duration: playerDurationRef.current,
      })
      if (error) throw error
      const result = data as { accepted: boolean; watched_sec: number; is_completed: boolean; just_completed: boolean }
      setSaveError(false)
      setWatched(result.watched_sec)
      if (result.is_completed) setCompleted(true)
      if (result.just_completed) router.refresh()
    } catch {
      trackerRef.current.restore(intervals)
      setSaveError(true)
    } finally {
      sendingRef.current = false
    }
  }, [lessonId, router, trackable])

  // Save progress regularly, when the tab is hidden, and when leaving the page.
  useEffect(() => {
    const tracker = trackerRef.current
    const flushTimer = window.setInterval(() => void flush(), FLUSH_EVERY_MS)
    const onHide = () => {
      if (document.visibilityState === "hidden") void flush()
    }
    document.addEventListener("visibilitychange", onHide)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.clearInterval(flushTimer)
      window.clearInterval(sampleTimer.current)
      tracker.stop()
      void flush()
    }
  }, [flush])

  const onPlayer = useCallback((p: YTPlayer | null) => {
    playerRef.current = p
    if (!p) {
      window.clearInterval(sampleTimer.current)
      trackerRef.current.stop()
    }
  }, [])

  const onStateChange = useCallback(
    (state: number, p: YTPlayer) => {
      const tracker = trackerRef.current
      playerDurationRef.current = Math.round(p.getDuration()) || playerDurationRef.current
      if (state === YT_STATE.PLAYING) {
        setEnded(false)
        tracker.sample(p.getCurrentTime())
        window.clearInterval(sampleTimer.current)
        sampleTimer.current = window.setInterval(() => {
          const cur = playerRef.current
          if (cur && cur.getPlayerState() === YT_STATE.PLAYING) tracker.sample(cur.getCurrentTime())
        }, SAMPLE_EVERY_MS)
      } else {
        tracker.sample(p.getCurrentTime())
        tracker.stop()
        window.clearInterval(sampleTimer.current)
        if (state === YT_STATE.PAUSED || state === YT_STATE.ENDED) void flush()
        if (state === YT_STATE.ENDED) setEnded(true)
      }
    },
    [flush],
  )

  const start = resumeAt > 5 && resumeAt < durationSec - 15 ? Math.floor(resumeAt) : 0
  const required = Math.ceil(durationSec * COMPLETE_AT)
  const pct = durationSec > 0 ? Math.min(100, Math.round((watched / required) * 100)) : 0

  return (
    <div>
      <VeyroPlayer
        videoRef={videoRef}
        title={title}
        label={label}
        start={start}
        className="rounded-2xl shadow-[0_30px_60px_-30px_rgb(10_31_68/0.6)] ring-1 ring-navy/10"
        onPlayer={onPlayer}
        onStateChange={onStateChange}
        renderEnded={(replay) => (
          <>
            <p className="font-display text-2xl font-bold tracking-[-0.02em]">Video complete</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={replay} className="btn btn-ghost-light">
                Watch again
              </button>
              {nextHref && (
                <Link href={nextHref} className="btn btn-white">
                  Go to next item
                </Link>
              )}
            </div>
          </>
        )}
        renderError={(message, retry) => (
          <div className="max-w-md" role="alert">
            <p className="text-lg font-semibold">This video can&rsquo;t be played right now</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{message} You can go to the next item while the course is updated.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={retry} className="btn btn-ghost-light">
                Try again
              </button>
              {nextHref && (
                <Link href={nextHref} className="btn btn-white">
                  Go to next item
                </Link>
              )}
            </div>
          </div>
        )}
      />

      {trackable ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          {completed ? (
            <p className="flex items-center gap-2 font-semibold text-success" role="status">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              Completed
            </p>
          ) : (
            <div className="min-w-[14rem] flex-1">
              <div className="flex items-center justify-between gap-4 text-sm text-muted">
                <span>
                  Watched <span className="font-semibold text-ink">{formatClock(watched)}</span> of {formatClock(durationSec)}
                </span>
                <span>Completes at {Math.round(COMPLETE_AT * 100)}% watched</span>
              </div>
              <div className="mt-2 h-1.5 max-w-full overflow-hidden rounded-full bg-brand-100">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0056d2] to-[#4b93ff] transition-[width] duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          {saveError && (
            <p className="w-full text-sm font-semibold text-danger" role="alert">
              Progress isn&rsquo;t saving right now. We&rsquo;ll keep trying while you watch.
            </p>
          )}
          {completed && ended && nextHref && (
            <Link href={nextHref} className="btn btn-primary ml-auto">
              Go to next item
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-brand-50 p-4">
          <p>You&rsquo;re previewing this item. Enroll to save your progress.</p>
          <Link href={courseHref} className="btn btn-primary">
            Enroll for free
          </Link>
        </div>
      )}
    </div>
  )
}
