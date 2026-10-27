import { test } from "node:test"
import assert from "node:assert/strict"
import { PlaybackTracker } from "../src/lib/playback-tracker.ts"

test("continuous playback becomes one interval", () => {
  const t = new PlaybackTracker()
  for (let s = 0; s <= 10; s++) t.sample(s)
  assert.deepEqual(t.drain(), [[0, 10]])
})

test("seeking forward does not count skipped time", () => {
  const t = new PlaybackTracker()
  for (let s = 0; s <= 5; s++) t.sample(s)
  t.sample(300) // seek
  t.sample(301); t.sample(302)
  assert.deepEqual(t.drain(), [[0, 5], [300, 302]])
})

test("2x playback (2s steps) still counts as continuous", () => {
  const t = new PlaybackTracker()
  for (let s = 0; s <= 20; s += 2) t.sample(s)
  assert.deepEqual(t.drain(), [[0, 20]])
})

test("drain continues from current position without double counting", () => {
  const t = new PlaybackTracker()
  for (let s = 0; s <= 10; s++) t.sample(s)
  assert.deepEqual(t.drain(), [[0, 10]])
  for (let s = 11; s <= 15; s++) t.sample(s)
  assert.deepEqual(t.drain(), [[10, 15]])
})

test("pause closes the segment; resume starts fresh", () => {
  const t = new PlaybackTracker()
  for (let s = 0; s <= 4; s++) t.sample(s)
  t.stop()
  t.sample(4); t.sample(5); t.sample(6)
  assert.deepEqual(t.drain(), [[0, 4], [4, 6]])
})

test("failed sends are restored and bounded", () => {
  const t = new PlaybackTracker()
  t.restore(Array.from({ length: 60 }, (_, i) => [i, i + 1] as [number, number]))
  assert.equal(t.drain().length, 40)
})

test("ignores invalid samples", () => {
  const t = new PlaybackTracker()
  t.sample(NaN); t.sample(-3); t.sample(1); t.sample(2)
  assert.deepEqual(t.drain(), [[1, 2]])
})
