import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ArrowLeftIcon, CheckIcon, LessonTypeIcon, LockIcon } from "@/components/icons"
import { ProgressBar } from "@/components/progress-bar"
import { getCurrentUser } from "@/lib/auth"
import {
  courseCompletion,
  getCourseBySlug,
  getLessonContent,
  getMyCourseProgress,
  getMyEnrollment,
  type CourseDetail,
  type LessonProgress,
} from "@/lib/data"
import { formatDuration } from "@/lib/format"
import { LessonOpened, MarkAsRead } from "./lesson-client"
import { VideoLesson } from "./video-lesson"
import { ClassVideo } from "@/components/class-video"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TYPE_LABEL = { video: "Video", article: "Reading", quiz: "Quiz" } as const
const labelFor = (l: { type: keyof typeof TYPE_LABEL; has_video: boolean }) =>
  l.type === "article" && l.has_video ? "Video + reading" : TYPE_LABEL[l.type]
const iconFor = (l: { type: keyof typeof TYPE_LABEL; has_video: boolean }) => (l.has_video ? "video" : l.type)

export default function LessonPage({ params }: PageProps<"/learn/[slug]/[lessonId]">) {
  return (
    <Suspense fallback={<ClassroomSkeleton />}>
      <Classroom params={params} />
    </Suspense>
  )
}

function ClassroomSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto grid w-full max-w-[90rem] lg:grid-cols-[21rem_minmax(0,1fr)]">
      <div className="hidden border-r border-line p-5 lg:block">
        <div className="skeleton h-6 w-3/4" />
        <div className="skeleton mt-6 h-80" />
      </div>
      <div className="p-6 lg:p-10">
        <div className="skeleton h-4 w-56" />
        <div className="skeleton mt-4 h-9 w-2/3" />
        <div className="skeleton mt-6 aspect-video" />
      </div>
    </div>
  )
}

async function Classroom({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params
  if (!UUID.test(lessonId)) notFound()

  const [course, user] = await Promise.all([getCourseBySlug(slug), getCurrentUser()])
  if (!course) notFound()

  const flat = course.modules.flatMap((m, mi) => m.lessons.map((l, li) => ({ ...l, mi, li, moduleTitle: m.title })))
  const index = flat.findIndex((l) => l.id === lessonId)
  if (index === -1) notFound()
  const lesson = flat[index]

  const enrollment = user ? await getMyEnrollment(course.id, user.id) : null
  if (!enrollment && !lesson.is_preview) {
    redirect(user ? `/courses/${slug}` : `/sign-in?next=${encodeURIComponent(`/learn/${slug}/${lessonId}`)}`)
  }

  const [content, progress] = await Promise.all([
    getLessonContent(lesson.id),
    enrollment && user ? getMyCourseProgress(course.id, user.id) : Promise.resolve(new Map<string, LessonProgress>()),
  ])
  const trackable = Boolean(enrollment)
  const completion = courseCompletion(course, progress)
  const mine = progress.get(lesson.id)

  const canOpen = (l: { is_preview: boolean }) => trackable || l.is_preview
  const prev = flat.slice(0, index).reverse().find(canOpen) ?? null
  const next = flat.slice(index + 1).find(canOpen) ?? null
  const hrefFor = (id: string) => `/learn/${slug}/${id}`
  const courseDone = trackable && completion.total > 0 && completion.done === completion.total

  return (
    <div className="mx-auto grid w-full max-w-[90rem] flex-1 lg:grid-cols-[21rem_minmax(0,1fr)]">
      <title>{`${lesson.title} | ${course.title}`}</title>
      {trackable && <LessonOpened lessonId={lesson.id} />}

      <aside className="order-2 border-t border-line lg:order-1 lg:border-r lg:border-t-0">
        <CourseOutline course={course} currentId={lesson.id} progress={progress} trackable={trackable} slug={slug} completion={completion} />
      </aside>

      <article className="order-1 min-w-0 px-4 py-6 sm:px-8 lg:order-2 lg:px-12 lg:py-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Link href={`/courses/${slug}`} className="text-brand hover:underline">
            {course.title}
          </Link>
          <span aria-hidden="true">›</span>
          <span>Module {lesson.mi + 1}</span>
          <span aria-hidden="true">›</span>
          <span className="text-ink">{lesson.title}</span>
        </nav>
        <h1 className="mt-3 text-[1.75rem] font-semibold leading-tight sm:text-[2rem]">{lesson.title}</h1>
        <p className="mt-1 text-muted">
          {labelFor(lesson)} · {formatDuration(lesson.duration_sec)}
        </p>

        <div className="mt-6">
          {!content ? (
            <div className="card p-6" role="alert">
              <p className="font-semibold">This item isn&rsquo;t available yet</p>
              <p className="mt-1 text-muted">It may still be in preparation. Go to the next item, or come back later.</p>
            </div>
          ) : lesson.type === "video" && content.video_ref ? (
            <VideoLesson
              key={lesson.id}
              lessonId={lesson.id}
              videoRef={content.video_ref}
              title={lesson.title}
              label={`Module ${lesson.mi + 1} · ${lesson.moduleTitle}`}
              durationSec={lesson.duration_sec}
              resumeAt={Number(mine?.last_position_sec ?? 0)}
              watchedSec={mine?.watched_sec ?? 0}
              completed={Boolean(mine?.is_completed)}
              trackable={trackable}
              courseHref={`/courses/${slug}`}
              nextHref={next ? hrefFor(next.id) : null}
            />
          ) : lesson.type === "article" ? (
            <>
              {content.video_ref && (
                <div className="mb-10">
                  <ClassVideo
                    key={lesson.id}
                    videoRef={content.video_ref}
                    title={lesson.title}
                    moduleLabel={`Module ${lesson.mi + 1} · ${lesson.moduleTitle}`}
                    nextHref={next ? hrefFor(next.id) : null}
                  />
                </div>
              )}
              <div className="prose-reading">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.body_md ?? ""}</ReactMarkdown>
              </div>
              <div className="mt-10 border-t border-line pt-6">
                {trackable ? (
                  <MarkAsRead lessonId={lesson.id} completed={Boolean(mine?.is_completed)} nextHref={next ? hrefFor(next.id) : null} />
                ) : (
                  <PreviewNotice courseHref={`/courses/${slug}`} />
                )}
              </div>
            </>
          ) : (
            <div className="card p-6">
              <p className="font-semibold">Quizzes are coming soon</p>
              <p className="mt-1 text-muted">This item type isn&rsquo;t available yet. Go to the next item.</p>
            </div>
          )}
        </div>

        {content?.attribution && <p className="mt-4 text-sm text-muted">{content.attribution}</p>}

        {courseDone && (
          <div className="mt-8 rounded-xl border border-success/30 bg-success-50 p-6">
            <p className="flex items-center gap-2 text-lg font-semibold text-success">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              Course complete
            </p>
            <p className="mt-2">
              You&rsquo;ve completed every class in {course.title}. Your certificate of completion is ready to download and share.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/certificates" className="btn btn-primary">
                View your certificate
              </Link>
              <Link href="/courses" className="btn btn-outline">
                Find your next course
              </Link>
            </div>
          </div>
        )}

        <nav aria-label="Item navigation" className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {prev ? (
            <Link href={hrefFor(prev.id)} className="btn btn-outline">
              <ArrowLeftIcon className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={hrefFor(next.id)} className="btn btn-primary">
              Go to next item
            </Link>
          )}
        </nav>
      </article>
    </div>
  )
}

function PreviewNotice({ courseHref }: { courseHref: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-brand-50 p-4">
      <p>You&rsquo;re previewing this item. Enroll to save your progress.</p>
      <Link href={courseHref} className="btn btn-primary">
        Enroll for free
      </Link>
    </div>
  )
}

function CourseOutline({
  course,
  currentId,
  progress,
  trackable,
  slug,
  completion,
}: {
  course: CourseDetail
  currentId: string
  progress: Map<string, LessonProgress>
  trackable: boolean
  slug: string
  completion: { done: number; total: number; ratio: number }
}) {
  return (
    <div className="lg:sticky lg:top-[6.6rem] lg:max-h-[calc(100vh-6.6rem)] lg:overflow-y-auto">
      <div className="border-b border-line p-5">
        <Link href={`/courses/${slug}`} className="font-semibold leading-snug hover:underline">
          {course.title}
        </Link>
        {trackable ? (
          <div className="mt-3">
            <ProgressBar size="sm" done={completion.done} total={completion.total} />
            <p className="mt-1.5 text-sm text-muted">
              {completion.done}/{completion.total} items complete
            </p>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">Preview mode</p>
        )}
      </div>
      <nav aria-label="Course items" className="pb-4">
        {course.modules.map((m, mi) => (
          <details key={m.id} open className="group border-b border-line last:border-b-0">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block font-semibold">Module {mi + 1}</span>
                <span className="block text-sm text-muted">{m.title}</span>
              </span>
            </summary>
            <ol className="pb-2">
              {m.lessons.map((l) => {
                const done = progress.get(l.id)?.is_completed
                const current = l.id === currentId
                const open = trackable || l.is_preview
                const inner = (
                  <>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                      {done ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
                          <CheckIcon className="h-3 w-3" title="Completed" />
                        </span>
                      ) : open ? (
                        <LessonTypeIcon type={iconFor(l)} className="h-[18px] w-[18px] text-muted" />
                      ) : (
                        <LockIcon className="h-4 w-4 text-muted" title="Enroll to unlock" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block leading-snug ${current ? "font-semibold" : ""} ${open ? "" : "text-muted"}`}>{l.title}</span>
                      <span className="text-sm text-muted">
                        {labelFor(l)} · {formatDuration(l.duration_sec)}
                      </span>
                    </span>
                  </>
                )
                return (
                  <li key={l.id}>
                    {open ? (
                      <Link
                        href={`/learn/${slug}/${l.id}`}
                        aria-current={current ? "page" : undefined}
                        className={`flex gap-3 border-l-4 px-4 py-2.5 ${current ? "border-brand bg-brand-50" : "border-transparent hover:bg-soft"}`}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex gap-3 border-l-4 border-transparent px-4 py-2.5">{inner}</div>
                    )}
                  </li>
                )
              })}
            </ol>
          </details>
        ))}
      </nav>
    </div>
  )
}
