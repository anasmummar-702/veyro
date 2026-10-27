/**
 * Turns periodic playback-position samples into watched intervals.
 *
 * Only continuous playback counts: a jump backwards or forwards (a seek) closes
 * the current interval and starts a new one at the new position, so skipped
 * sections are never reported as watched. The server merges and validates the
 * intervals again; this is evidence of playback, not proof of attention.
 */
export class PlaybackTracker {
  private start: number | null = null
  private last = 0
  private pending: [number, number][] = []

  private readonly maxStepSec: number

  constructor(maxStepSec = 4) {
    this.maxStepSec = maxStepSec
  }

  /** Record the player position while the video is playing. */
  sample(t: number) {
    if (!Number.isFinite(t) || t < 0) return
    if (this.start === null) {
      this.start = t
      this.last = t
      return
    }
    const step = t - this.last
    if (step < -0.5 || step > this.maxStepSec) {
      this.closeSegment()
      this.start = t
    }
    this.last = t
  }

  /** Playback stopped (pause, end, buffering, tab hidden). */
  stop() {
    this.closeSegment()
    this.start = null
  }

  /** Intervals to send, including the open one; keeps tracking from the current position. */
  drain(): [number, number][] {
    if (this.start !== null && this.last > this.start) {
      this.pending.push([round(this.start), round(this.last)])
      this.start = this.last
    }
    const out = this.pending
    this.pending = []
    return out
  }

  /** Put intervals back after a failed send (bounded so a long outage can't grow forever). */
  restore(intervals: [number, number][]) {
    this.pending = [...intervals, ...this.pending].slice(-40)
  }

  get position() {
    return this.last
  }

  private closeSegment() {
    if (this.start !== null && this.last > this.start) {
      this.pending.push([round(this.start), round(this.last)])
    }
  }
}

const round = (n: number) => Math.round(n * 10) / 10
