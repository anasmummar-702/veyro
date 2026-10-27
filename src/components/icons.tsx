type IconProps = { className?: string; title?: string }

function Svg({ className = "h-4 w-4", title, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  )
}

export const PlayIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="7.5" />
    <path d="M8.5 7.2v5.6l4.4-2.8z" fill="currentColor" stroke="none" />
  </Svg>
)
export const ReadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4.5h5a2 2 0 0 1 2 2V16a1.6 1.6 0 0 0-1.6-1.6H3zM17 4.5h-5a2 2 0 0 0-2 2V16a1.6 1.6 0 0 1 1.6-1.6H17z" />
  </Svg>
)
export const QuizIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="13" height="13" rx="2" />
    <path d="M7 10l2 2 4-4.5" />
  </Svg>
)
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 10.5l3.5 3.5 7.5-8" strokeWidth={2.2} />
  </Svg>
)
export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
  </Svg>
)
export const CardIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
    <path d="M2.5 8.5h15M5.5 12.5h3" />
  </Svg>
)
export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 10H4M9 5l-5 5 5 5" />
  </Svg>
)
export const ChevronIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 8l4 4 4-4" />
  </Svg>
)
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="9" r="5.5" />
    <path d="M13.2 13.2L17 17" />
  </Svg>
)

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6v4l2.5 2" />
  </Svg>
)
export const LayersIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 3l7 3.5-7 3.5-7-3.5z" />
    <path d="M3 10l7 3.5 7-3.5M3 13.5l7 3.5 7-3.5" />
  </Svg>
)
export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 10h12M11 5l5 5-5 5" />
  </Svg>
)
export const SparkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 2.5l1.6 4.9 4.9 1.6-4.9 1.6L10 15.5l-1.6-4.9L3.5 9l4.9-1.6z" />
  </Svg>
)
export const ChartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 16.5h13M6 13V9.5M10 13V5.5M14 13v-5" />
  </Svg>
)

export const TargetIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="7" />
    <circle cx="10" cy="10" r="3.5" />
    <circle cx="10" cy="10" r="0.6" fill="currentColor" />
  </Svg>
)
export const AwardIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="7.5" r="4.5" />
    <path d="M7.2 11l-1.2 6 4-2 4 2-1.2-6" />
  </Svg>
)
export const PenIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.5 3.5l3 3L7 16H4v-3z" />
    <path d="M11.5 5.5l3 3" />
  </Svg>
)
export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10" cy="10" r="7" />
    <path d="M3 10h14M10 3c2.2 2.4 2.2 11.6 0 14M10 3c-2.2 2.4-2.2 11.6 0 14" />
  </Svg>
)

export function LessonTypeIcon({ type, className }: { type: "video" | "article" | "quiz"; className?: string }) {
  if (type === "video") return <PlayIcon className={className} title="Video" />
  if (type === "article") return <ReadIcon className={className} title="Reading" />
  return <QuizIcon className={className} title="Quiz" />
}
