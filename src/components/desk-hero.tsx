/**
 * Home-page hero illustration: a study desk with a laptop playing a lesson, a stack of
 * course books, a plant, a mug and a notebook, with floating progress cards.
 *
 * Everything is drawn in code (SVG + HTML) on an 846×780 design grid and scales with its
 * container via container-query units, so it stays crisp at every size.
 */

const W = 846
/** Convert a design-grid pixel value to container-width units. */
const c = (px: number) => `${((px / W) * 100).toFixed(3)}cqw`

export function DeskHero() {
  return (
    <div className="desk-hero relative mx-auto w-full max-w-[44rem] [container-type:inline-size] lg:max-w-none xl:w-[112%]" aria-hidden="true">
      <div className="relative" style={{ aspectRatio: `${W} / 780` }}>
        <BackdropSvg />
        <LaptopScreen />
        <ForegroundSvg />

        {/* progress card, top left */}
        <Card x={30} y={60} w={186} delay={350} className="spatial-float-a" style={{ padding: `${c(20)} ${c(22)}` }}>
          <svg viewBox="0 0 140 56" className="block w-full">
            <defs>
              <linearGradient id="dh-spark" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#5b8def" />
                <stop offset="1" stopColor="#1f57d6" />
              </linearGradient>
            </defs>
            <path
              d="M4 50 C 18 48, 22 30, 36 32 S 52 52, 66 34 S 82 8, 96 16 S 112 40, 124 22 S 134 6, 138 4"
              fill="none"
              stroke="url(#dh-spark)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
          <p className="font-display font-extrabold leading-none tracking-[-0.03em] text-ink" style={{ fontSize: c(36), marginTop: c(18) }}>
            78%
          </p>
          <p className="font-medium text-ink/80" style={{ fontSize: c(14), marginTop: c(8) }}>
            Course progress
          </p>
        </Card>

        {/* lessons completed card, top right */}
        <Card x={622} y={30} w={180} delay={450} className="spatial-float-b flex items-center" style={{ padding: c(16), gap: c(16) }}>
          <span
            className="flex shrink-0 items-center justify-center rounded-[22%] bg-gradient-to-b from-[#f4f6fa] to-[#e6eaf2]"
            style={{ width: c(62), height: c(70) }}
          >
            <span
              className="flex items-center justify-center rounded-full bg-gradient-to-br from-[#ffd36e] via-[#f7a928] to-[#e57f0c] text-white shadow-[0_6px_14px_-4px_rgb(229_127_12/0.7)]"
              style={{ width: c(44), height: c(44) }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: c(24), height: c(24) }}>
                <path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M9 20h6M10 17h4" />
              </svg>
            </span>
          </span>
          <span className="block">
            <span className="block font-medium text-muted" style={{ fontSize: c(14) }}>
              Completed
            </span>
            <span className="font-display block font-extrabold leading-none tracking-[-0.03em] text-ink" style={{ fontSize: c(32), marginTop: c(6) }}>
              12
            </span>
            <span className="block font-medium text-ink/80" style={{ fontSize: c(14), marginTop: c(4) }}>
              lessons
            </span>
          </span>
        </Card>

        {/* encouragement card, right */}
        <Card x={604} y={368} w={214} delay={600} rotate={7} className="spatial-float-c" style={{ padding: `${c(24)} ${c(22)}` }}>
          <p className="font-display font-bold tracking-[-0.02em] text-ink" style={{ fontSize: c(20) }}>
            Keep it up!
          </p>
          <p className="leading-snug text-muted" style={{ fontSize: c(14.5), marginTop: c(8) }}>
            Only 3 lessons left to finish this course
          </p>
          <span className="flex items-center" style={{ gap: c(7), marginTop: c(18) }}>
            {[1, 1, 1, 1, 0].map((done, i) => (
              <span
                key={i}
                className={`flex items-center justify-center rounded-full ${done ? "bg-gradient-to-br from-[#3f7bf0] to-[#1f4fc4] text-white" : "border-2 border-dashed border-[#c5d1e6]"}`}
                style={{ width: c(28), height: c(28) }}
              >
                {done ? (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: c(13), height: c(13) }}>
                    <path d="M5 10.5l3.2 3L15 7" />
                  </svg>
                ) : null}
              </span>
            ))}
          </span>
        </Card>
      </div>
    </div>
  )
}

function Card({
  x,
  y,
  w,
  rotate = 0,
  delay,
  className = "",
  style,
  children,
}: {
  x: number
  y: number
  w: number
  rotate?: number
  delay: number
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  return (
    <div className="hero-pop absolute" style={{ left: c(x), top: c(y), width: c(w), transform: rotate ? `rotate(${rotate}deg)` : undefined, animationDelay: `${delay}ms` }}>
      <div
        className={`rounded-[1.1em] border border-white bg-white/90 shadow-[0_1px_2px_rgb(11_23_54/0.06),0_24px_44px_-18px_rgb(20_40_90/0.28)] backdrop-blur-md ${className}`}
        style={{ fontSize: c(16), ...style }}
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ laptop screen */

const LESSONS = ["How the web works", "HTML elements", "Text and links", "Semantic HTML", "Forms and inputs"]

function LaptopScreen() {
  // Screen is a parallelogram: bottom-left corner at (225, 452), 442 wide, 352 tall,
  // skewed so the right edge sits lower (the laptop is turned slightly away).
  return (
    <div
      className="absolute"
      style={{
        left: c(225),
        top: c(100),
        width: c(442),
        height: c(352),
        transformOrigin: "0% 100%",
        transform: "skewY(6.84deg) skewX(-4deg)",
      }}
    >
      <div
        className="h-full w-full rounded-[3.2%/4%] bg-gradient-to-br from-[#2a2f3a] to-[#0c0f16] shadow-[0_30px_60px_-20px_rgb(10_20_50/0.55)]"
        style={{ padding: c(9) }}
      >
        <div className="flex h-full w-full overflow-hidden rounded-[1.5%/2%] bg-[#0b1530] text-white" style={{ fontSize: c(10) }}>
          {/* main panel */}
          <div className="flex min-w-0 flex-[1_1_72%] flex-col" style={{ padding: `${c(14)} ${c(14)} ${c(10)}` }}>
            <p className="text-white/45" style={{ fontSize: c(7.5) }}>
              Coding / Module 2 / Class 3
            </p>
            <p className="font-display font-bold tracking-[-0.02em]" style={{ fontSize: c(19), marginTop: c(5) }}>
              Build your first website
            </p>
            <div className="relative flex-1 overflow-hidden rounded-[4%/6%] bg-gradient-to-br from-[#f7f8fb] to-[#e4e8f0]" style={{ marginTop: c(9) }}>
              <svg viewBox="0 0 230 140" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
                {/* code editor */}
                <rect x="10" y="12" width="122" height="116" rx="5" fill="#0f1a33" />
                <circle cx="19" cy="20" r="2" fill="#ff6b6b" />
                <circle cx="26" cy="20" r="2" fill="#ffd166" />
                <circle cx="33" cy="20" r="2" fill="#4ade80" />
                <g fontFamily="ui-monospace, Menlo, Consolas, monospace" fontSize="6.4">
                  {[
                    [["#7aa2ff", "<section"], ["#9ad0ff", " class"], ["#c3e88d", '="hero"'], ["#7aa2ff", ">"]],
                    [["#7aa2ff", "  <h1>"], ["#e5e9f5", "Hi, I'm Ana"], ["#7aa2ff", "</h1>"]],
                    [["#7aa2ff", "  <p>"], ["#e5e9f5", "Web designer"], ["#7aa2ff", "</p>"]],
                    [["#7aa2ff", "  <a"], ["#9ad0ff", " href"], ["#c3e88d", '="#work"'], ["#7aa2ff", ">"]],
                    [["#e5e9f5", "    See my work"]],
                    [["#7aa2ff", "  </a>"]],
                    [["#7aa2ff", "</section>"]],
                  ].map((line, i) => (
                    <text key={i} x="16" y={38 + i * 12}>
                      <tspan fill="#5b6b8c">{i + 1}  </tspan>
                      {line.map(([fill, t], j) => (
                        <tspan key={j} fill={fill} xmlSpace="preserve">
                          {t}
                        </tspan>
                      ))}
                    </text>
                  ))}
                  <rect x="64" y="111" width="3.2" height="8" fill="#7aa2ff">
                    <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite" />
                  </rect>
                </g>
                {/* live preview */}
                <rect x="140" y="12" width="80" height="116" rx="5" fill="#ffffff" stroke="#d7deea" />
                <rect x="140" y="12" width="80" height="11" rx="5" fill="#eef2f8" />
                <rect x="146" y="16" width="44" height="3.5" rx="1.75" fill="#d1d9e6" />
                <rect x="148" y="34" width="40" height="7" rx="2" fill="#0a1f44" />
                <rect x="148" y="46" width="52" height="4" rx="2" fill="#b7c2d6" />
                <rect x="148" y="54" width="34" height="4" rx="2" fill="#b7c2d6" />
                <rect x="148" y="66" width="34" height="10" rx="5" fill="#2257d6" />
                <rect x="148" y="86" width="30" height="30" rx="3" fill="#e4ecff" />
                <rect x="182" y="86" width="30" height="30" rx="3" fill="#dfe7f7" />
              </svg>
            </div>
            <div className="flex items-center text-white/60" style={{ gap: c(6), marginTop: c(9), fontSize: c(7) }}>
              <span>Progress</span>
              <span className="relative flex-1 rounded-full bg-white/15" style={{ height: c(3) }}>
                <span className="absolute inset-y-0 left-0 w-[61%] rounded-full bg-[#3d7cf5]" />
                <span className="absolute top-1/2 h-[220%] -translate-y-1/2 rounded-full bg-white" style={{ left: "60%", aspectRatio: "1" }} />
              </span>
              <span>61%</span>
            </div>
            <div className="flex text-white/55" style={{ gap: c(14), marginTop: c(9), fontSize: c(7) }}>
              {["Notes", "Resources", "Practice"].map((t) => (
                <span key={t} className="flex items-center" style={{ gap: c(3) }}>
                  <span className="rounded-[2px] border border-white/50" style={{ width: c(6), height: c(6) }} />
                  {t}
                </span>
              ))}
            </div>
          </div>
          {/* lessons sidebar */}
          <div className="flex-[0_0_28%] border-l border-white/5 bg-[#101c3c]" style={{ padding: `${c(14)} ${c(7)}` }}>
            <p className="text-white/40" style={{ fontSize: c(6.5), paddingLeft: c(5) }}>
              Module 2
            </p>
            <p className="font-semibold" style={{ fontSize: c(10), marginTop: c(14), paddingLeft: c(5) }}>
              Lessons
            </p>
            <ul style={{ marginTop: c(8) }}>
              {LESSONS.map((l, i) => (
                <li
                  key={l}
                  className={`flex rounded-[0.4em] ${i === 2 ? "bg-gradient-to-r from-[#2d63e0] to-[#1f4fc4] text-white" : "text-white/75"}`}
                  style={{ gap: c(5), padding: `${c(7)} ${c(5)}`, marginTop: c(3), fontSize: c(7.5) }}
                >
                  <span className="text-white/60">0{i + 1}</span>
                  <span className="truncate">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ svg layers */

// Keyboard base, as a parallelogram: back edge A→B under the screen, then toward the viewer.
const A = [225, 452]
const B = [667, 505]
const D = [100, 500]
const baseMatrix = `matrix(${B[0] - A[0]} ${B[1] - A[1]} ${D[0] - A[0]} ${D[1] - A[1]} ${A[0]} ${A[1]})`

function BackdropSvg() {
  const keys: React.ReactNode[] = []
  const cols = 13
  const rows = 4
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      keys.push(
        <rect
          key={`${r}-${k}`}
          x={0.07 + (k * 0.86) / cols}
          y={0.12 + (r * 0.44) / rows}
          width={0.86 / cols - 0.008}
          height={0.44 / rows - 0.03}
          rx={0.008}
          fill="#262c38"
        />,
      )
    }
  }
  return (
    <svg viewBox="0 0 846 780" className="absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <linearGradient id="dh-blue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8eefc" />
          <stop offset="1" stopColor="#cfdcf8" />
        </linearGradient>
        <linearGradient id="dh-blue2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9e4fb" />
          <stop offset="1" stopColor="#a9c1f1" />
        </linearGradient>
        <radialGradient id="dh-table" cx="0.45" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1f2f5" />
        </radialGradient>
        <linearGradient id="dh-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c9ced8" />
          <stop offset="0.5" stopColor="#aeb5c3" />
          <stop offset="1" stopColor="#8f97a8" />
        </linearGradient>
        <linearGradient id="dh-pot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe2e8" />
        </linearGradient>
        <linearGradient id="dh-leaf" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#5e7f35" />
          <stop offset="1" stopColor="#a8c46a" />
        </linearGradient>
        <pattern id="dh-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill="#c6cfdf" />
        </pattern>
        <filter id="dh-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* backdrop shapes */}
      <g className="hero-fade">
        <circle cx="492" cy="168" r="156" fill="url(#dh-blue)" />
        <circle cx="86" cy="368" r="96" fill="#efe8de" />
        <circle cx="770" cy="356" r="104" fill="url(#dh-blue2)" />
        <rect x="140" y="-6" width="96" height="64" fill="url(#dh-dots)" />
        <rect x="700" y="180" width="96" height="80" fill="url(#dh-dots)" />
      </g>

      {/* round white table */}
      <ellipse cx="560" cy="800" rx="560" ry="290" fill="#1c2b55" opacity="0.08" filter="url(#dh-soft)" />
      <ellipse cx="560" cy="790" rx="560" ry="282" fill="url(#dh-table)" />
      <path d="M0 790 A560 282 0 0 1 1120 790" fill="none" stroke="#e5e8ee" strokeWidth="2" />

      {/* plant */}
      <g>
        {[
          "M160 362 C 120 330, 112 290, 118 262 C 140 284, 158 320, 160 362",
          "M160 362 C 150 310, 160 270, 186 240 C 192 282, 180 330, 160 362",
          "M160 362 C 176 322, 206 300, 232 296 C 222 330, 196 352, 160 362",
          "M160 362 C 138 344, 108 340, 92 346 C 108 366, 136 370, 160 362",
          "M160 362 C 156 330, 140 300, 142 280 C 160 300, 166 330, 160 362",
        ].map((d, i) => (
          <path key={i} d={d} fill="url(#dh-leaf)" opacity={i === 4 ? 0.85 : 1} />
        ))}
        <path d="M118 362 h84 v62 a14 14 0 0 1 -14 14 h-56 a14 14 0 0 1 -14 -14 z" fill="url(#dh-pot)" />
        <ellipse cx="160" cy="362" rx="42" ry="7" fill="#f6f7f9" stroke="#e2e5ea" />
      </g>

      {/* laptop: soft shadow, base with keys and trackpad, front lip */}
      <ellipse cx="400" cy="560" rx="290" ry="38" fill="#1c2b55" opacity="0.18" filter="url(#dh-soft)" />
      <path
        d={`M${D[0]} ${D[1]} L${D[0] + B[0] - A[0]} ${D[1] + B[1] - A[1]} l0 9 L${D[0]} ${D[1] + 9} z`}
        fill="#6f7789"
      />
      <g transform={baseMatrix}>
        <rect x="0" y="0" width="1" height="1" fill="url(#dh-base)" />
        <rect x="0" y="0" width="1" height="0.06" fill="#1a1e27" opacity="0.45" />
        {keys}
        <rect x="0.36" y="0.66" width="0.28" height="0.28" rx="0.01" fill="#a3aab8" stroke="#8a92a3" strokeWidth="0.004" />
      </g>
    </svg>
  )
}

function ForegroundSvg() {
  // Book spines slope up to the right by about 8°.
  const books = [
    { y: 650, h: 50, fill: "#38445e", text: "#e9edf5", label: "EDITING", x0: -14 },
    { y: 604, h: 46, fill: "#ece7dd", text: "#3a4152", label: "MARKETING", x0: -6 },
    { y: 560, h: 44, fill: "#2b4fb4", text: "#ffffff", label: "MINDSET", x0: -20 },
  ]
  const len = 305
  const rise = 44
  return (
    <svg viewBox="0 0 846 780" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <defs>
        <linearGradient id="dh-mug" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#24376a" />
          <stop offset="0.6" stopColor="#14244b" />
          <stop offset="1" stopColor="#0b1631" />
        </linearGradient>
        <filter id="dh-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* notebook with pen */}
      <g transform="rotate(9 420 690)">
        <rect x="262" y="628" width="320" height="140" rx="6" fill="#1c2b55" opacity="0.16" filter="url(#dh-shadow)" />
        <rect x="258" y="618" width="320" height="140" rx="6" fill="#fbfbfa" stroke="#e3e4e8" />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1="282" x2="556" y1={656 + i * 16} y2={656 + i * 16} stroke="#e7e9ee" />
        ))}
        <path d="M296 660 q30 -8 60 0 t60 0 M296 690 h40 l10 -8 l10 8 h40 M300 716 q40 10 90 -4" fill="none" stroke="#9aa1b0" strokeWidth="1.4" />
        <rect x="258" y="618" width="320" height="10" rx="3" fill="#eef0f3" />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M${272 + i * 13.6} 624 v-9 a3 3 0 0 1 6 0 v9`} fill="none" stroke="#7d8597" strokeWidth="1.8" strokeLinecap="round" />
        ))}
        <g transform="rotate(-38 470 700)">
          <rect x="380" y="694" width="190" height="11" rx="5.5" fill="#1d2230" />
          <path d="M570 694 l22 5.5 l-22 5.5 z" fill="#3a4050" />
          <rect x="396" y="692" width="8" height="15" rx="2" fill="#6b7385" />
        </g>
      </g>

      {/* mug */}
      <g>
        <ellipse cx="648" cy="668" rx="62" ry="12" fill="#1c2b55" opacity="0.2" filter="url(#dh-shadow)" />
        <path d="M690 590 c34 0 38 52 2 54" fill="none" stroke="#14244b" strokeWidth="13" strokeLinecap="round" />
        <path d="M598 556 h100 v92 a16 16 0 0 1 -16 16 h-68 a16 16 0 0 1 -16 -16 z" fill="url(#dh-mug)" />
        <ellipse cx="648" cy="556" rx="50" ry="10" fill="#0a142c" stroke="#2a3d72" strokeWidth="2" />
      </g>

      {/* stack of course books */}
      <g>
        <ellipse cx="140" cy="712" rx="170" ry="16" fill="#1c2b55" opacity="0.18" filter="url(#dh-shadow)" />
        {books.map((b) => (
          <g key={b.label}>
            {/* page edge on the right end */}
            <path d={`M${b.x0 + len} ${b.y - rise} l14 -10 l0 ${b.h} l-14 10 z`} fill="#f3f1ec" stroke="#dcd8cf" strokeWidth="0.8" />
            {/* spine */}
            <path d={`M${b.x0} ${b.y} L${b.x0 + len} ${b.y - rise} l0 ${b.h} L${b.x0} ${b.y + b.h} z`} fill={b.fill} />
            <path d={`M${b.x0} ${b.y + 4} L${b.x0 + len} ${b.y - rise + 4}`} stroke="#fff" strokeOpacity="0.12" strokeWidth="2" />
            <text
              x={b.x0 + 40}
              y={b.y + b.h / 2 + 6}
              fill={b.text}
              fontSize="17"
              fontWeight="600"
              letterSpacing="2.2"
              fontFamily="var(--font-sans), sans-serif"
              transform={`rotate(-8.2 ${b.x0 + 40} ${b.y + b.h / 2})`}
            >
              {b.label}
            </text>
          </g>
        ))}
        {/* top cover of the top book */}
        <path d={`M-20 560 L285 516 l14 -10 L-6 550 z`} fill="#3a62cc" />
      </g>
    </svg>
  )
}
