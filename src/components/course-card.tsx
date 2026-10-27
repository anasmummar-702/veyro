import Link from "next/link"
import { CourseCover } from "@/components/course-cover"
import { LogoMark } from "@/components/site-header"
import type { CourseSummary } from "@/lib/data"
import { LEVEL_LABEL, formatDuration } from "@/lib/format"

export function CourseCard({ course, priority = false }: { course: CourseSummary; priority?: boolean }) {
  return (
    <article className="card card-hover group relative flex h-full flex-col p-3">
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
        <CourseCover motif={course.coverMotif} tone={course.coverTone} seed={course.slug} rounded={false} />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand shadow-sm backdrop-blur">Free</span>
      </div>
      <div className="flex flex-1 flex-col px-1 pb-1 pt-3">
        <p className="flex items-center gap-2 text-sm text-muted">
          <LogoMark className="h-5 w-5" />
          {course.instructorName}
        </p>
        <h3 className="mt-2 text-[1.08rem] font-bold leading-snug tracking-[-0.01em]">
          <Link
            href={`/courses/${course.slug}`}
            prefetch={priority ? true : undefined}
            className="after:absolute after:inset-0 after:content-[''] transition-colors group-hover:text-brand"
          >
            {course.title}
          </Link>
        </h3>
        {course.subtitle && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{course.subtitle}</p>}
        <div className="mt-auto pt-4">
        <div className="flex items-center gap-2 border-t border-line pt-3 text-[0.8rem] font-medium text-muted">
          <span className="rounded-md bg-brand-50 px-2 py-0.5 font-semibold text-brand">{LEVEL_LABEL[course.level]}</span>
          <span>{course.lessonCount} lessons</span>
          <span aria-hidden="true">·</span>
          <span>{formatDuration(course.durationSec)}</span>
        </div>
        </div>
      </div>
    </article>
  )
}

export function CourseGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card p-3">
          <div className="skeleton aspect-[16/9]" />
          <div className="space-y-2.5 px-1 pt-3">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-5 w-4/5" />
            <div className="skeleton h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
