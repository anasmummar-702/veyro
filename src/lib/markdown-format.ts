// Pure helpers behind the Markdown toolbar in the section editor.
// Each one takes the textarea value and selection and returns a single
// contiguous replacement plus where the selection should land afterwards,
// so the editor can apply it in one step (and keep native undo working).

export type Edit = {
  /** Start of the replaced range in the original value. */
  from: number
  /** End of the replaced range in the original value. */
  to: number
  /** Text that replaces value.slice(from, to). */
  text: string
  /** Selection in the resulting value. */
  selStart: number
  selEnd: number
}

export type LineKind = "heading" | "bullet" | "numbered" | "quote"

export function applyEdit(value: string, edit: Edit): string {
  return value.slice(0, edit.from) + edit.text + value.slice(edit.to)
}

const HEADING = /^\s*#{1,6}\s+/
const BULLET = /^(\s*)[-*+]\s+/
const NUMBERED = /^(\s*)\d+[.)]\s+/
const QUOTE = /^\s*>\s?/
const FENCE = /^[ \t]*```.*$/gm
const WORD = /[\p{L}\p{N}_'’-]/u

function lineStartAt(v: string, i: number) {
  return v.lastIndexOf("\n", i - 1) + 1
}

function lineEndAt(v: string, i: number) {
  const n = v.indexOf("\n", i)
  return n === -1 ? v.length : n
}

/** Full lines touched by the selection. A selection ending right after a newline does not include the next line. */
function lineRange(v: string, s: number, e: number) {
  const endForLines = e > s && v[e - 1] === "\n" ? e - 1 : e
  return { from: lineStartAt(v, s), to: lineEndAt(v, endForLines) }
}

function prevLineOf(v: string, from: number): string | null {
  if (from === 0) return null
  return v.slice(lineStartAt(v, from - 1), from - 1)
}

function nextLineOf(v: string, to: number): string | null {
  if (to >= v.length) return null
  return v.slice(to + 1, lineEndAt(v, to + 1))
}

/** Blank lines needed so a block replacing v[from, to) stands on its own. */
function blockPadding(v: string, from: number, to: number, sameKind?: RegExp) {
  const prev = prevLineOf(v, from)
  const next = nextLineOf(v, to)
  const pre = prev !== null && prev.trim() !== "" && !(sameKind && sameKind.test(prev)) ? "\n" : ""
  const post = next !== null && next.trim() !== "" && !(sameKind && sameKind.test(next)) ? "\n" : ""
  return { pre, post }
}

/** The fenced code block (if any) that encloses the lines from..to. */
function enclosingFence(v: string, from: number, to: number) {
  FENCE.lastIndex = 0
  let open: { start: number; end: number } | null = null
  let m: RegExpExecArray | null
  while ((m = FENCE.exec(v))) {
    const fence = { start: m.index, end: m.index + m[0].length }
    if (!open) {
      if (fence.start >= from) return null
      open = fence
    } else {
      if (fence.start > to) return { open, close: fence }
      open = null
    }
  }
  return null
}

export function isInsideCodeBlock(v: string, pos: number) {
  const from = lineStartAt(v, pos)
  return enclosingFence(v, from, lineEndAt(v, pos)) !== null
}

/** Bold / italic / inline code: wrap the selection (or the word under the cursor), or unwrap if already wrapped. */
export function toggleInline(v: string, s: number, e: number, marker: string, placeholder: string): Edit {
  const m = marker.length

  // Selection sits just inside the markers: **|text|**
  if (s >= m && v.slice(s - m, s) === marker && v.slice(e, e + m) === marker) {
    return { from: s - m, to: e + m, text: v.slice(s, e), selStart: s - m, selEnd: e - m }
  }

  // Selection includes the markers: |**text**|
  const sel = v.slice(s, e)
  if (sel.length > 2 * m && sel.startsWith(marker) && sel.endsWith(marker)) {
    const inner = sel.slice(m, -m)
    return { from: s, to: e, text: inner, selStart: s, selEnd: s + inner.length }
  }

  if (s === e) {
    let a = s
    let b = s
    while (a > 0 && WORD.test(v[a - 1])) a--
    while (b < v.length && WORD.test(v[b])) b++
    if (a === b) {
      // Nothing to wrap: insert markers with a selected placeholder, so typing replaces it.
      return { from: s, to: s, text: marker + placeholder + marker, selStart: s + m, selEnd: s + m + placeholder.length }
    }
    if (a >= m && v.slice(a - m, a) === marker && v.slice(b, b + m) === marker) {
      return { from: a - m, to: b + m, text: v.slice(a, b), selStart: s - m, selEnd: s - m }
    }
    return { from: a, to: b, text: marker + v.slice(a, b) + marker, selStart: s + m, selEnd: s + m }
  }

  // Markdown ignores "** text **", so keep surrounding spaces outside the markers.
  let a = s
  let b = e
  while (a < b && /\s/.test(v[a])) a++
  while (b > a && /\s/.test(v[b - 1])) b--
  if (a === b) {
    return { from: e, to: e, text: marker + placeholder + marker, selStart: e + m, selEnd: e + m + placeholder.length }
  }

  const text = v.slice(a, b)
  if (text.includes("\n")) {
    // Emphasis can't span lines, so wrap each line on its own (after any list/heading/quote prefix).
    const wrapped = text
      .split("\n")
      .map((line) => {
        const t = line.trim()
        if (!t) return line
        const lead = line.match(/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s?)?/)?.[0] ?? ""
        const body = line.slice(lead.length).trim()
        return body ? lead + marker + body + marker : line
      })
      .join("\n")
    return { from: a, to: b, text: wrapped, selStart: a, selEnd: a + wrapped.length }
  }
  return { from: a, to: b, text: marker + text + marker, selStart: a + m, selEnd: b + m }
}

/** Heading / bullet list / numbered list / quote on the current or selected lines. Click again to remove. */
export function toggleLines(v: string, s: number, e: number, kind: LineKind): Edit {
  const { from, to } = lineRange(v, s, e)
  const lines = v.slice(from, to).split("\n")
  const filled = lines.filter((l) => l.trim() !== "")
  const re = { heading: HEADING, bullet: BULLET, numbered: NUMBERED, quote: QUOTE }[kind]
  const removing = filled.length > 0 && filled.every((l) => re.test(l))

  let n = 1
  if (kind === "numbered" && !removing) {
    const prev = prevLineOf(v, from)
    const pm = prev?.match(/^\s*(\d+)[.)]\s+/)
    if (pm) n = Number(pm[1]) + 1
  }

  const multi = lines.length > 1
  const out = lines.map((line) => {
    if (removing) return line.replace(re, kind === "bullet" || kind === "numbered" ? "$1" : "")
    if (multi && line.trim() === "") return kind === "quote" ? ">" : line
    switch (kind) {
      case "heading":
        return "## " + line.replace(HEADING, "").replace(BULLET, "").replace(NUMBERED, "").replace(QUOTE, "").trimStart()
      case "bullet": {
        const indent = line.match(/^\s*/)?.[0] ?? ""
        return indent + "- " + line.trimStart().replace(HEADING, "").replace(BULLET, "").replace(NUMBERED, "")
      }
      case "numbered": {
        const indent = line.match(/^\s*/)?.[0] ?? ""
        return indent + `${n++}. ` + line.trimStart().replace(HEADING, "").replace(BULLET, "").replace(NUMBERED, "")
      }
      case "quote":
        return "> " + line
    }
  })
  const block = out.join("\n")

  const sameKind = kind === "heading" ? undefined : kind === "bullet" ? BULLET : kind === "numbered" ? NUMBERED : QUOTE
  const { pre, post } = removing ? { pre: "", post: "" } : blockPadding(v, from, to, sameKind)
  const start = from + pre.length

  if (s === e && !multi) {
    // Keep the cursor where it was in the line, but never inside the new prefix.
    const delta = block.length - (to - from)
    const prefixLen = removing ? 0 : (block.match(/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s?)/)?.[0].length ?? 0)
    const pos = Math.min(block.length, Math.max(prefixLen, s - from + delta))
    return { from, to, text: pre + block + post, selStart: start + pos, selEnd: start + pos }
  }
  return { from, to, text: pre + block + post, selStart: start, selEnd: start + block.length }
}

/** Code: inline `code` for part of a line, a fenced block for whole lines. Inside a block, removes the fences. */
export function toggleCode(v: string, s: number, e: number): Edit {
  const { from, to } = lineRange(v, s, e)
  const sel = v.slice(s, e)

  const fence = enclosingFence(v, from, to)
  if (fence) {
    const innerStart = fence.open.end + 1
    const innerEnd = Math.max(innerStart, fence.close.start - 1)
    const inner = v.slice(innerStart, innerEnd)
    const shift = innerStart - fence.open.start
    const clamp = (p: number) => Math.min(fence.open.start + inner.length, Math.max(fence.open.start, p - shift))
    return { from: fence.open.start, to: fence.close.end, text: inner, selStart: clamp(s), selEnd: clamp(e) }
  }

  if (s !== e && !sel.includes("\n") && !(s === from && e === to)) {
    return toggleInline(v, s, e, "`", "code")
  }

  const inner = v.slice(from, to)
  const { pre, post } = blockPadding(v, from, to)
  const block = "```\n" + inner + "\n```"
  const innerAt = from + pre.length + 4
  if (s === e) {
    const pos = innerAt + (s - from)
    return { from, to, text: pre + block + post, selStart: pos, selEnd: pos }
  }
  return { from, to, text: pre + block + post, selStart: innerAt, selEnd: innerAt + inner.length }
}

/** Insert a block on its own lines after the cursor's line, selecting `select` (part of the snippet) if given. */
export function insertBlock(v: string, s: number, e: number, snippet: string, select?: string): Edit {
  const lineFrom = lineStartAt(v, e)
  const lineTo = lineEndAt(v, e)
  const lineEmpty = v.slice(lineFrom, lineTo).trim() === ""

  let from: number
  let to: number
  let pre: string
  let post: string
  if (lineEmpty) {
    from = lineFrom
    to = lineTo
    ;({ pre, post } = blockPadding(v, from, to))
  } else {
    from = to = lineTo
    pre = "\n\n"
    const next = nextLineOf(v, lineTo)
    post = next !== null && next.trim() !== "" ? "\n" : ""
  }

  const start = from + pre.length
  const idx = select ? snippet.indexOf(select) : -1
  if (idx >= 0 && select) {
    return { from, to, text: pre + snippet + post, selStart: start + idx, selEnd: start + idx + select.length }
  }
  return { from, to, text: pre + snippet + post, selStart: start + snippet.length, selEnd: start + snippet.length }
}

/** Enter inside a list or quote: start the next item. Enter on an empty item: end the list. */
export function continueList(v: string, s: number, e: number): Edit | null {
  if (s !== e) return null
  const from = lineStartAt(v, s)
  const lineTo = lineEndAt(v, s)
  const line = v.slice(from, lineTo)
  if (isInsideCodeBlock(v, s)) return null

  const list = line.match(/^(\s*)([-*+]|(\d+)([.)]))(\s+)(\[[ xX]\]\s+)?/)
  const quote = list ? null : line.match(/^\s*>\s?/)
  const prefix = list?.[0] ?? quote?.[0]
  if (!prefix) return null
  if (s < from + prefix.length) return null

  if (line.slice(prefix.length).trim() === "") {
    if (s !== lineTo) return null
    return { from, to: lineTo, text: "", selStart: from, selEnd: from }
  }

  let next: string
  if (list) {
    const [, indent, bullet, num, delim, space, task] = list
    next = indent + (num ? `${Number(num) + 1}${delim}` : bullet) + space + (task ? "[ ] " : "")
  } else {
    next = prefix
  }
  const text = "\n" + next
  return { from: s, to: s, text, selStart: s + text.length, selEnd: s + text.length }
}
