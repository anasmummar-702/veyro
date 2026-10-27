import { LogoMark } from "@/components/site-header"
import type { Certificate } from "@/lib/data"

/** Design grid is 1123×794 (A4 landscape at 96 dpi); everything scales with the container. */
const W = 1123
const c = (px: number) => `${((px / W) * 100).toFixed(3)}cqw`

export function formatIssued(iso: string) {
  return new Date(iso).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })
}

/** The printable certificate of completion. */
export function CertificateArt({ cert, verifyUrl, className = "" }: { cert: Certificate; verifyUrl?: string; className?: string }) {
  return (
    <div className={`certificate-art w-full [container-type:inline-size] ${className}`}>
      <div
        className="relative overflow-hidden bg-white text-navy"
        style={{ aspectRatio: `${W} / 794`, fontSize: c(16) }}
        role="img"
        aria-label={`Certificate of completion awarded to ${cert.recipientName} for ${cert.courseTitle}, issued ${formatIssued(cert.issuedAt)}. Serial ${cert.serial}.`}
      >
        {/* soft corner light */}
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_70%_at_100%_0%,#e9f0ff_0%,transparent_60%),radial-gradient(50%_60%_at_0%_100%,#eef3ff_0%,transparent_60%)]" />
        {/* guilloché-style line pattern */}
        <svg aria-hidden="true" viewBox="0 0 1123 794" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <defs>
            <pattern id="cert-lines" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="22" stroke="#0056d2" strokeOpacity="0.035" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1123" height="794" fill="url(#cert-lines)" />
          {/* double frame */}
          <rect x="26" y="26" width="1071" height="742" rx="6" fill="none" stroke="#0a1f44" strokeWidth="3" />
          <rect x="40" y="40" width="1043" height="714" rx="3" fill="none" stroke="#2257d6" strokeOpacity="0.45" strokeWidth="1" />
          {/* corner ornaments */}
          {[
            [40, 40, 1, 1],
            [1083, 40, -1, 1],
            [40, 754, 1, -1],
            [1083, 754, -1, -1],
          ].map(([x, y, sx, sy], i) => (
            <path
              key={i}
              d={`M${x} ${y + sy * 64} L${x} ${y} L${x + sx * 64} ${y} M${x + sx * 12} ${y + sy * 40} L${x + sx * 12} ${y + sy * 12} L${x + sx * 40} ${y + sy * 12}`}
              fill="none"
              stroke="#0a1f44"
              strokeWidth="2.5"
            />
          ))}
        </svg>

        <div className="relative flex h-full flex-col items-center text-center" style={{ padding: `${c(78)} ${c(110)} ${c(64)}` }}>
          <div className="flex items-center" style={{ gap: c(10) }}>
            <LogoMark className="h-auto w-[3.4cqw]" />
            <span className="font-display font-extrabold tracking-[-0.04em]" style={{ fontSize: c(30) }}>
              veyro
            </span>
          </div>

          <p className="font-bold uppercase text-[#8a6a32]" style={{ fontSize: c(15), letterSpacing: "0.32em", marginTop: c(38) }}>
            Certificate of completion
          </p>
          <div aria-hidden="true" className="bg-gradient-to-r from-transparent via-[#c9a96a] to-transparent" style={{ height: c(1.5), width: c(260), marginTop: c(14) }} />

          <p className="text-muted" style={{ fontSize: c(19), marginTop: c(34) }}>
            This certifies that
          </p>
          <p className="font-serif italic leading-[1.05] text-navy" style={{ fontSize: c(cert.recipientName.length > 28 ? 58 : 72), marginTop: c(10) }}>
            {cert.recipientName}
          </p>
          <div aria-hidden="true" className="bg-navy/20" style={{ height: c(1), width: c(520), marginTop: c(12) }} />

          <p className="text-muted" style={{ fontSize: c(19), marginTop: c(26) }}>
            has successfully completed every class of the course
          </p>
          <p className="font-display font-bold leading-tight tracking-[-0.02em] text-[#2257d6]" style={{ fontSize: c(cert.courseTitle.length > 44 ? 28 : 34), marginTop: c(12), maxWidth: c(820) }}>
            {cert.courseTitle}
          </p>

          <div className="mt-auto grid w-full grid-cols-[1fr_auto_1fr] items-end">
            <div className="text-left">
              <p className="font-semibold" style={{ fontSize: c(18) }}>
                {formatIssued(cert.issuedAt)}
              </p>
              <div className="bg-navy/30" style={{ height: c(1), width: c(220), marginTop: c(8) }} />
              <p className="uppercase text-muted" style={{ fontSize: c(12), letterSpacing: "0.16em", marginTop: c(8) }}>
                Date issued
              </p>
            </div>

            <Seal />

            <div className="flex flex-col items-end text-right">
              <p className="font-serif italic" style={{ fontSize: c(30), lineHeight: 1 }}>
                Veyro
              </p>
              <div className="bg-navy/30" style={{ height: c(1), width: c(220), marginTop: c(8) }} />
              <p className="uppercase text-muted" style={{ fontSize: c(12), letterSpacing: "0.16em", marginTop: c(8) }}>
                Veyro Learning
              </p>
            </div>
          </div>

          <p className="font-mono text-muted" style={{ fontSize: c(12), marginTop: c(26), letterSpacing: "0.06em" }}>
            Certificate ID {cert.serial}
            {verifyUrl ? ` · Verify at ${verifyUrl}` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}

function Seal() {
  const points = 24
  const outer = 62
  const inner = 54
  const d =
    Array.from({ length: points * 2 }, (_, i) => {
      const r = i % 2 === 0 ? outer : inner
      const a = (Math.PI * i) / points - Math.PI / 2
      return `${i === 0 ? "M" : "L"}${(70 + r * Math.cos(a)).toFixed(2)} ${(70 + r * Math.sin(a)).toFixed(2)}`
    }).join(" ") + " Z"
  return (
    <svg viewBox="0 0 140 140" aria-hidden="true" style={{ width: c(132), height: c(132) }}>
      <defs>
        <linearGradient id="seal-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f7bf0" />
          <stop offset="1" stopColor="#0a1f44" />
        </linearGradient>
      </defs>
      <path d={d} fill="url(#seal-fill)" />
      <circle cx="70" cy="70" r="46" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" />
      <circle cx="70" cy="70" r="40" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.8" strokeDasharray="2 3" />
      <path d="M50 72 l13 13 l27 -30" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
