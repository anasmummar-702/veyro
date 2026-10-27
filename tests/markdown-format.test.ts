import { test } from "node:test"
import assert from "node:assert/strict"
import {
  applyEdit,
  continueList,
  insertBlock,
  toggleCode,
  toggleInline,
  toggleLines,
  type Edit,
} from "../src/lib/markdown-format.ts"

// "|" marks the cursor; "[...]" marks a selection.
function parse(marked: string) {
  const s = marked.search(/[|[]/)
  if (marked[s] === "|") return { v: marked.slice(0, s) + marked.slice(s + 1), s, e: s }
  const close = marked.indexOf("]", s)
  return { v: marked.slice(0, s) + marked.slice(s + 1, close) + marked.slice(close + 1), s, e: close - 1 }
}

function show(v: string, edit: Edit) {
  const out = applyEdit(v, edit)
  if (edit.selStart === edit.selEnd) return out.slice(0, edit.selStart) + "|" + out.slice(edit.selStart)
  return out.slice(0, edit.selStart) + "[" + out.slice(edit.selStart, edit.selEnd) + "]" + out.slice(edit.selEnd)
}

function run(marked: string, fn: (v: string, s: number, e: number) => Edit | null) {
  const { v, s, e } = parse(marked)
  const edit = fn(v, s, e)
  return edit ? show(v, edit) : null
}

const bold = (v: string, s: number, e: number) => toggleInline(v, s, e, "**", "bold text")
const heading = (v: string, s: number, e: number) => toggleLines(v, s, e, "heading")
const bullet = (v: string, s: number, e: number) => toggleLines(v, s, e, "bullet")
const numbered = (v: string, s: number, e: number) => toggleLines(v, s, e, "numbered")
const quote = (v: string, s: number, e: number) => toggleLines(v, s, e, "quote")

test("heading applies to the current line instead of inserting placeholder text", () => {
  assert.equal(run("Intro\nConfidence is the key|\nMore", heading), "Intro\n\n## Confidence is the key|\n\nMore")
  assert.equal(run("|", heading), "## |")
})

test("heading toggles off and replaces other prefixes", () => {
  assert.equal(run("## Title|", heading), "Title|")
  assert.equal(run("- Ti|tle", heading), "## Ti|tle")
})

test("bold wraps the selection, keeping spaces outside", () => {
  assert.equal(run("make [mistakes ]and", bold), "make **[mistakes]** and")
  assert.equal(run("make **[mistakes]** and", bold), "make [mistakes] and")
})

test("bold with no selection wraps the word under the cursor, or inserts a selected placeholder", () => {
  assert.equal(run("be ha|ppy", bold), "be **ha|ppy**")
  assert.equal(run("be **ha|ppy**", bold), "be ha|ppy")
  assert.equal(run("Text |", bold), "Text **[bold text]**")
})

test("bold across lines wraps each line after its prefix", () => {
  assert.equal(run("[- one\n- two]", bold), "[- **one**\n- **two**]")
})

test("bullet list converts selected lines and starts on its own block", () => {
  assert.equal(
    run("Para\n[learn about your down falls\nmanage people]\nAfter", bullet),
    "Para\n\n[- learn about your down falls\n- manage people]\n\nAfter",
  )
})

test("numbered list numbers lines and continues an existing list", () => {
  assert.equal(run("[a\nb\nc]", numbered), "[1. a\n2. b\n3. c]")
  assert.equal(run("1. a\n2. b\nc|", numbered), "1. a\n2. b\n3. c|")
  assert.equal(run("[1. a\n2. b]", numbered), "[a\nb]")
})

test("numbered converts a bullet list", () => {
  assert.equal(run("[- a\n- b]", numbered), "[1. a\n2. b]")
})

test("quote prefixes lines and is separated from the next paragraph", () => {
  assert.equal(run("A key idea|\nNext", quote), "> A key idea|\n\nNext")
  assert.equal(run("> A key idea|", quote), "A key idea|")
})

test("code wraps the current line in a fenced block instead of inserting 'code here'", () => {
  assert.equal(run("Intro\nprint(\"hi\")|", toggleCode), "Intro\n\n```\nprint(\"hi\")|\n```")
  assert.equal(run("|", toggleCode), "```\n|\n```")
})

test("code on part of a line is inline code", () => {
  assert.equal(run("call [print()] now", toggleCode), "call `[print()]` now")
})

test("code inside a fenced block removes the fences", () => {
  assert.equal(run("```\na\nb|\n```\nafter", toggleCode), "a\nb|\nafter")
  assert.equal(run("```\n|\n```\nx", toggleCode), "|\nx")
})

test("code wraps selected lines", () => {
  assert.equal(run("[x = 1\ny = 2]", toggleCode), "```\n[x = 1\ny = 2]\n```")
})

test("insertBlock goes after the current line with the placeholder selected", () => {
  assert.equal(
    run("Some te|xt\nNext", (v, s, e) => insertBlock(v, s, e, "## Try this\n\nDescribe it.", "Describe it.")),
    "Some text\n\n## Try this\n\n[Describe it.]\n\nNext",
  )
  assert.equal(run("|", (v, s, e) => insertBlock(v, s, e, "## Try this\n\nDo.", "Do.")), "## Try this\n\n[Do.]")
})

test("Enter continues lists and quotes, and ends them on an empty item", () => {
  assert.equal(run("- one|", continueList), "- one\n- |")
  assert.equal(run("3. three|", continueList), "3. three\n4. |")
  assert.equal(run("> idea|", continueList), "> idea\n> |")
  assert.equal(run("- one\n- |", continueList), "- one\n|")
  assert.equal(run("plain|", continueList), null)
  assert.equal(run("```\n- in code|\n```", continueList), null)
})
