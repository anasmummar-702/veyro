// Shared by server and browser code.

/** Pull the 11-character video id out of any common YouTube link (or a bare id). */
export function parseYouTubeId(input: string): string | null {
  const text = input.trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text
  let url: URL
  try {
    url = new URL(text.startsWith("http") ? text : `https://${text}`)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\.|^m\./, "")
  let id: string | null = null
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0]
  else if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
    id = url.searchParams.get("v")
    if (!id) {
      const m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)
      id = m?.[1] ?? null
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
}
