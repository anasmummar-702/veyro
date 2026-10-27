"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"
import { loadYouTubeApi, YT_STATE, type YTPlayer } from "@/lib/youtube"
import { formatClock } from "@/lib/format"

type Stage = "cover" | "starting" | "active" | "ended" | "error"

const SPEEDS = [1, 1.25, 1.5, 1.75, 2, 0.75]
const HIDE_CONTROLS_AFTER_MS = 2500
// The YouTube frame is made this much taller than the visible box on each side.
// YouTube centres the picture, so its title bar, channel name, logo and pause shelf
// all sit in the cropped-off area while the video itself fills the box exactly.
const CROP_PX = 160

const noopSubscribe = () => () => {}

function errorMessage(code: number | "blocked") {
  if (code === "blocked") return "The video player couldn’t load. Check your connection, or turn off any content blocker for this site, then try again."
  if (code === 101 || code === 150 || code === 153) return "This video can’t be played inside Veyro right now."
  if (code === 100) return "This video has been removed."
  return "This video isn’t available right now."
}

export type VeyroPlayerProps = {
  videoRef: string
  title: string
  /** Small line above the title on the cover. */
  label?: string
  /** Seconds to start from on the first play (e.g. where the learner left off). */
  start?: number
  className?: string
  onPlayer?: (player: YTPlayer | null) => void
  onStateChange?: (state: number, player: YTPlayer) => void
  onError?: (code: number | "blocked") => void
  /** Content for the panel shown when the video ends. Defaults to a "Watch again" button. */
  renderEnded?: (replay: () => void) => ReactNode
  /** Content for the panel shown when the video can't play. */
  renderError?: (message: string, retry: () => void) => ReactNode
}

/**
 * Veyro's video player. Shows the video's cover image until the learner presses play,
 * then plays the video with Veyro's own controls. The YouTube frame underneath can't be
 * clicked and its title, channel and logo are cropped out, so learners stay on Veyro.
 */
export function VeyroPlayer({
  videoRef,
  title,
  label,
  start = 0,
  className = "",
  onPlayer,
  onStateChange,
  onError,
  renderEnded,
  renderError,
}: VeyroPlayerProps) {
  const [stage, setStage] = useState<Stage>("cover")
  const [session, setSession] = useState(0)
  const [needsTap, setNeedsTap] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [muted, setMuted] = useState(false)
  const [autoMuted, setAutoMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const canFullscreen = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(document.fullscreenEnabled),
    () => false,
  )
  const [errorText, setErrorText] = useState("")
  const [startAt, setStartAt] = useState(start)

  const boxRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const seekingRef = useRef(false)
  const hideTimer = useRef<number | undefined>(undefined)

  // Keep the latest callbacks without re-creating the player when they change.
  const callbacks = useRef({ onPlayer, onStateChange, onError })
  useEffect(() => {
    callbacks.current = { onPlayer, onStateChange, onError }
  })

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === boxRef.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // Create the player for each play session (first play, replay, retry).
  useEffect(() => {
    if (!session) return
    let cancelled = false
    let destroyed = false
    let instance: YTPlayer | null = null
    let poll: number | undefined
    let autoplayTimer: number | undefined

    const teardown = () => {
      window.clearInterval(poll)
      window.clearTimeout(autoplayTimer)
      if (instance && !destroyed) {
        destroyed = true
        instance.destroy()
      }
      if (playerRef.current) {
        playerRef.current = null
        callbacks.current.onPlayer?.(null)
      }
    }

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled || !mountRef.current) return
        const el = document.createElement("div")
        mountRef.current.replaceChildren(el)
        instance = new YT.Player(el, {
          videoId: videoRef,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            iv_load_policy: 3,
            cc_load_policy: 0,
            playsinline: 1,
            start: Math.floor(startAt),
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              if (cancelled) return
              const p = e.target
              playerRef.current = p
              callbacks.current.onPlayer?.(p)
              setDuration(p.getDuration())
              setMuted(p.isMuted())
              p.playVideo()
              // Some browsers (mostly phones) block autoplay with sound: retry muted, then ask for a tap.
              const blocked = () => {
                const s = p.getPlayerState()
                return s === YT_STATE.UNSTARTED || s === YT_STATE.CUED
              }
              autoplayTimer = window.setTimeout(() => {
                if (cancelled || !blocked()) return
                p.mute()
                setMuted(true)
                setAutoMuted(true)
                p.playVideo()
                autoplayTimer = window.setTimeout(() => {
                  if (!cancelled && blocked()) setNeedsTap(true)
                }, 1500)
              }, 1500)
              poll = window.setInterval(() => {
                if (seekingRef.current) return
                setTime(p.getCurrentTime())
                setBuffered(p.getVideoLoadedFraction())
              }, 250)
            },
            onStateChange: (e) => {
              if (cancelled) return
              const p = e.target
              callbacks.current.onStateChange?.(e.data, p)
              if (e.data === YT_STATE.PLAYING) {
                window.clearTimeout(autoplayTimer)
                setNeedsTap(false)
                setPlaying(true)
                setDuration(p.getDuration())
                setStage("active")
              } else if (e.data === YT_STATE.PAUSED) {
                setPlaying(false)
                setControlsVisible(true)
              } else if (e.data === YT_STATE.ENDED) {
                // Remove YouTube's end screen (suggested videos) and show Veyro's panel instead.
                setPlaying(false)
                teardown()
                setStage("ended")
              }
            },
            onError: (e) => {
              if (cancelled) return
              callbacks.current.onError?.(e.data)
              teardown()
              setErrorText(errorMessage(e.data))
              setStage("error")
            },
          },
        })
      })
      .catch(() => {
        if (cancelled) return
        callbacks.current.onError?.("blocked")
        setErrorText(errorMessage("blocked"))
        setStage("error")
      })

    return () => {
      cancelled = true
      teardown()
    }
    // startAt only changes together with session, so it never restarts a running player.
  }, [session, videoRef, startAt])

  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  const begin = useCallback((fromStart: boolean) => {
    if (fromStart) setStartAt(0)
    setNeedsTap(false)
    setPlaying(false)
    setTime(0)
    setBuffered(0)
    setAutoMuted(false)
    setSpeed(1)
    setControlsVisible(true)
    setStage("starting")
    setSession((s) => s + 1)
  }, [])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), HIDE_CONTROLS_AFTER_MS)
  }, [])

  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.getPlayerState() === YT_STATE.PLAYING) p.pauseVideo()
    else p.playVideo()
  }, [])

  const seekBy = useCallback((delta: number) => {
    const p = playerRef.current
    if (!p) return
    const to = Math.max(0, Math.min(p.getDuration() - 0.5, p.getCurrentTime() + delta))
    p.seekTo(to, true)
    setTime(to)
  }, [])

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.isMuted()) p.unMute()
    else p.mute()
    setMuted(!p.isMuted())
    setAutoMuted(false)
  }, [])

  const cycleSpeed = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]
    p.setPlaybackRate(next)
    setSpeed(next)
  }, [speed])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void boxRef.current?.requestFullscreen().catch(() => {})
  }, [])

  const onSurfacePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    // On touch, the first tap only brings the controls back.
    if (e.pointerType === "touch" && !controlsVisible) return showControls()
    togglePlay()
    showControls()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (stage !== "active") return
    if ((e.target as HTMLElement).closest("button, input")) return
    const key = e.key.toLowerCase()
    const actions: Record<string, () => void> = {
      " ": togglePlay,
      k: togglePlay,
      arrowleft: () => seekBy(-5),
      arrowright: () => seekBy(5),
      j: () => seekBy(-10),
      l: () => seekBy(10),
      m: toggleMute,
      f: toggleFullscreen,
    }
    const run = actions[key]
    if (!run) return
    e.preventDefault()
    run()
    showControls()
  }

  const active = stage === "active"
  const showChrome = active && (controlsVisible || !playing)
  const playedPct = duration ? Math.min(100, (time / duration) * 100) : 0
  const bufferedPct = Math.max(playedPct, Math.min(100, buffered * 100))

  return (
    <div
      ref={boxRef}
      role="region"
      aria-label={`Video: ${title}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onPointerMove={active ? showControls : undefined}
      onContextMenu={(e) => e.preventDefault()}
      className={`veyro-player relative aspect-video w-full select-none overflow-hidden bg-black outline-none ${fullscreen ? "!aspect-auto h-full !rounded-none" : ""} ${className}`}
    >
      {/* YouTube frame: oversized and cropped, never receives clicks. */}
      {(stage === "starting" || active) && (
        <div
          ref={mountRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 [&>iframe]:pointer-events-none [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full"
          style={{ top: -CROP_PX, bottom: -CROP_PX }}
        />
      )}

      {active && (
        <div
          className={`absolute inset-0 ${showChrome ? "" : "cursor-none"}`}
          onPointerUp={onSurfacePointerUp}
          onDoubleClick={canFullscreen ? toggleFullscreen : undefined}
        >
          {!playing && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/35">
              <PlayBadge />
            </span>
          )}
        </div>
      )}

      {active && autoMuted && (
        <button
          type="button"
          onClick={toggleMute}
          className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/85"
        >
          <VolumeIcon muted />
          Tap to unmute
        </button>
      )}

      {active && (
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-12 text-white transition-opacity duration-300 sm:px-4 ${showChrome ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(time, duration || 1)}
            aria-label="Seek"
            aria-valuetext={`${formatClock(time)} of ${formatClock(duration)}`}
            onPointerDown={() => (seekingRef.current = true)}
            onPointerUp={() => (seekingRef.current = false)}
            onChange={(e) => {
              const to = Number(e.target.value)
              setTime(to)
              playerRef.current?.seekTo(to, true)
              showControls()
            }}
            className="veyro-seek block w-full"
            style={{ ["--played" as string]: `${playedPct}%`, ["--buffered" as string]: `${bufferedPct}%` }}
          />
          <div className="mt-1 flex items-center gap-0.5 sm:gap-1">
            <ControlButton label={playing ? "Pause (k)" : "Play (k)"} onClick={togglePlay}>
              {playing ? (
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              )}
            </ControlButton>
            <ControlButton label="Back 10 seconds (j)" onClick={() => seekBy(-10)} className="hidden sm:flex">
              <SkipIcon back />
            </ControlButton>
            <ControlButton label="Forward 10 seconds (l)" onClick={() => seekBy(10)} className="hidden sm:flex">
              <SkipIcon />
            </ControlButton>
            <ControlButton label={muted ? "Unmute (m)" : "Mute (m)"} onClick={toggleMute}>
              <VolumeIcon muted={muted} />
            </ControlButton>
            <span className="ml-1.5 text-sm font-medium tabular-nums text-white/90">
              {formatClock(time)} <span className="text-white/55">/ {formatClock(duration)}</span>
            </span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={cycleSpeed}
              title="Playback speed"
              aria-label={`Playback speed ${speed}x`}
              className="h-9 min-w-11 rounded-md px-2 text-sm font-bold tabular-nums hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
            >
              {speed}×
            </button>
            {canFullscreen && (
              <ControlButton label={fullscreen ? "Exit full screen (f)" : "Full screen (f)"} onClick={toggleFullscreen}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
                  {fullscreen ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
                </svg>
              </ControlButton>
            )}
          </div>
        </div>
      )}

      {(stage === "cover" || stage === "starting") && (
        <button
          type="button"
          onClick={() => {
            if (stage === "cover") begin(false)
            else if (needsTap) playerRef.current?.playVideo()
          }}
          disabled={stage === "starting" && !needsTap}
          className="group absolute inset-0 flex h-full w-full flex-col justify-end text-left text-white disabled:cursor-progress"
          aria-label={`Play video: ${title}`}
        >
          <Cover videoRef={videoRef} />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {stage === "starting" && !needsTap ? (
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-black/45 backdrop-blur sm:h-24 sm:w-24" role="status" aria-label="Loading video">
                <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/25 border-t-white" />
              </span>
            ) : (
              <PlayBadge />
            )}
          </span>
          <span className="relative p-5 sm:p-7">
            {label && <span className="block text-xs font-bold uppercase tracking-[0.16em] text-white/75">{label}</span>}
            <span className="font-display mt-1 block text-xl font-bold tracking-[-0.02em] [text-shadow:0_2px_12px_rgb(0_0_0/0.5)] sm:text-2xl">{title}</span>
            {start > 5 && stage === "cover" && (
              <span className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">Continue from {formatClock(start)}</span>
            )}
          </span>
        </button>
      )}

      {stage === "ended" && (
        <Panel videoRef={videoRef}>
          {renderEnded ? (
            renderEnded(() => begin(true))
          ) : (
            <>
              <p className="font-display text-2xl font-bold tracking-[-0.02em]">Video complete</p>
              <button type="button" onClick={() => begin(true)} className="btn btn-ghost-light mt-6">
                Watch again
              </button>
            </>
          )}
        </Panel>
      )}

      {stage === "error" && (
        <Panel videoRef={videoRef}>
          {renderError ? (
            renderError(errorText, () => begin(false))
          ) : (
            <>
              <p className="font-display text-xl font-bold tracking-[-0.02em]">Video unavailable</p>
              <p className="mt-2 max-w-[44ch] text-white/75">{errorText}</p>
              <button type="button" onClick={() => begin(false)} className="btn btn-ghost-light mt-6">
                Try again
              </button>
            </>
          )}
        </Panel>
      )}
    </div>
  )
}

/** The video's own cover image, at the best size available. */
function Cover({ videoRef }: { videoRef: string }) {
  const sizes = ["maxresdefault", "sddefault", "hqdefault"]
  const [i, setI] = useState(0)
  const next = () => setI((n) => Math.min(n + 1, sizes.length - 1))
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={sizes[i]}
      src={`https://i.ytimg.com/vi/${videoRef}/${sizes[i]}.jpg`}
      alt=""
      aria-hidden="true"
      draggable={false}
      referrerPolicy="no-referrer"
      onError={next}
      // A missing size can come back as a tiny grey placeholder instead of an error.
      onLoad={(e) => e.currentTarget.naturalWidth <= 120 && next()}
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
    />
  )
}

/** Blurred still under a navy wash, used behind the end and error panels. */
function Panel({ videoRef, children }: { videoRef: string; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoRef}/hqdefault.jpg`}
        alt=""
        aria-hidden="true"
        draggable={false}
        referrerPolicy="no-referrer"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-md"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#061633] via-[#0a1f44]/75 to-[#0a1f44]/45" />
      <div className="relative flex flex-col items-center">{children}</div>
    </div>
  )
}

function PlayBadge() {
  return (
    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-brand shadow-[0_18px_40px_-10px_rgb(0_0_0/0.6)] ring-8 ring-white/15 transition-transform duration-200 group-hover:scale-105 sm:h-24 sm:w-24">
      <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 sm:h-9 sm:w-9" aria-hidden="true">
        <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
      </svg>
    </span>
  )
}

function ControlButton({ label, onClick, className = "", children }: { label: string; onClick: () => void; className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white ${className}`}
    >
      {children}
    </button>
  )
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      {muted ? <path d="M16 9.5l5 5M21 9.5l-5 5" /> : <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
    </svg>
  )
}

function SkipIcon({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={back ? undefined : { transform: "scaleX(-1)" }}>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4h4" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none" style={back ? undefined : { transform: "scaleX(-1)", transformOrigin: "12px 12px" }}>
        10
      </text>
    </svg>
  )
}
