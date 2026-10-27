import Image from "next/image"
import "./home-cream.css"
import Link from "next/link"
import { Suspense } from "react"
import { CourseCard, CourseGridSkeleton } from "@/components/course-card"
import { CourseCover } from "@/components/course-cover"
import { CountUp, type CountKind } from "@/components/count-up"
import {
  ArrowRightIcon,
  AwardIcon,
  CardIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  LayersIcon,
  LockIcon,
  PenIcon,
  PlayIcon,
  ReadIcon,
  TargetIcon,
} from "@/components/icons"
import { ProgressBar } from "@/components/progress-bar"
import { firstName, getCurrentUser } from "@/lib/auth"
import { listCategories, listCourses, listMyCourses } from "@/lib/data"

// ---------------------------------------------------------------- content
// Edit these lists to change what the home page says about Veyro.

const MISSION_POINTS = [
  {
    title: "Teach the skills that open doors",
    body: "Mindset, marketing, editing and coding are four skills that compound. We teach each one step by step, in an order that builds real ability.",
  },
  {
    title: "Help people finish what they start",
    body: "Short modules, saved progress and an obvious next lesson make it easy to keep going a little every day.",
  },
  {
    title: "Keep learning within everyone's reach",
    body: "Every course is free during early access, and core learning on Veyro will always stay accessible.",
  },
]

const SERVICES: {
  icon: (p: { className?: string }) => React.ReactNode
  title: string
  body: string
  soon?: boolean
}[] = [
  { icon: LayersIcon, title: "Structured courses", body: "Courses broken into modules and short lessons, so you always know what to learn next." },
  { icon: ReadIcon, title: "Clear, practical classes", body: "Every class is a focused lesson with examples, written to be read in under ten minutes." },
  { icon: PenIcon, title: "Practice in every class", body: "Each class ends with a hands-on exercise, so you apply the skill instead of just reading about it." },
  { icon: ChartIcon, title: "Progress tracking", body: "Every class you finish is saved, so you can always pick up exactly where you left off." },
  { icon: TargetIcon, title: "Graded quizzes", body: "Check what you've learned with quizzes at the end of each module.", soon: true },
  { icon: AwardIcon, title: "Certificates", body: "Earn a verified certificate for every course you complete, ready to download and share." },
]

const STEPS = [
  { title: "Join for free", body: "Create your account in seconds with just an email." },
  { title: "Choose a course", body: "Browse subjects and enroll in one click." },
  { title: "Learn at your pace", body: "Watch, read and practise — your place is always saved." },
  { title: "Complete the course", body: "Finish every lesson, then start your next one." },
]

const ROADMAP = [
  { stage: "Available now", title: "Four complete courses", items: ["Mindset, Marketing, Editing, Coding", "Practice in every class", "Verified certificates"], live: true },
  { stage: "Coming next", title: "Go further", items: ["Graded quizzes", "Video lessons", "Advanced follow-up courses"] },
  { stage: "On our roadmap", title: "Teach on Veyro", items: ["Instructor studio for creators", "Learner discussions", "Mobile app"] },
]

// ---------------------------------------------------------------- page

export default function HomePage() {
  return (
    <>
      <span hidden className="home-cream" />
      <Suspense fallback={<HeroSignedOut />}>
        <HeroOrWelcome />
      </Suspense>

      <Suspense fallback={<div className="h-28" />}>
        <Stats />
      </Suspense>

      <section className="mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6">
        <p className="eyebrow">Subjects</p>
        <h2 className="h-section mt-3">Explore categories</h2>
        <Suspense fallback={<div className="mt-6 h-24" />}>
          <Categories />
        </Suspense>
      </section>

      <section id="courses" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 pt-24 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Curated collection</p>
            <h2 className="h-section mt-3">Most popular courses</h2>
            <p className="mt-1 text-muted">Start learning today. Every course is free.</p>
          </div>
          <Link href="/courses" className="link hidden shrink-0 sm:block">
            Show all courses
          </Link>
        </div>
        <div className="mt-6">
          <Suspense fallback={<CourseGridSkeleton />}>
            <PopularCourses />
          </Suspense>
        </div>
        <Link href="/courses" className="btn btn-outline mt-6 sm:hidden">
          Show all courses
        </Link>
      </section>

      <section id="mission" className="relative mt-16 scroll-mt-28 overflow-hidden bg-gradient-to-b from-transparent via-[#f3eee6] to-transparent py-12">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">About Veyro</p>
            <h2 className="h-section mt-3 max-w-[22ch]">Our mission is to make deep learning free and finishable</h2>
            <p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-muted">
              We believe anyone should be able to truly understand hard subjects — not just watch videos about them.
              Veyro exists to close the gap between finding great content and actually learning from it.
            </p>
            <Link href="/sign-up" className="btn btn-primary mt-7">
              Join for Free
            </Link>
          </div>
          <ol className="space-y-4">
            {MISSION_POINTS.map((m, i) => (
              <li key={m.title} className="card card-hover flex gap-4 p-6">
                <span className="icon-tile-solid font-display h-11 w-11 shrink-0 text-base font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-display text-lg font-bold tracking-[-0.01em]">{m.title}</p>
                  <p className="mt-1 leading-relaxed text-muted">{m.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="services" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 pt-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow">What we offer</p>
          <h2 className="h-section mt-3">Everything you need to learn a subject properly</h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, body, soon }) => (
            <div key={title} className="card card-hover p-7">
              <div className="flex items-center justify-between">
                <span className="icon-tile-solid h-12 w-12">
                  <Icon className="h-5 w-5" />
                </span>
                {soon && <span className="rounded-full border border-accent/40 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-accent-dark">Coming soon</span>}
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-[-0.01em]">{title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 pt-24 sm:px-6">
        <p className="eyebrow">The path</p>
        <h2 className="h-section mt-3">How Veyro works</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card relative p-6">
              <div className="flex items-center gap-3">
                <span className="font-display flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand bg-white text-sm font-bold text-brand">
                  0{i + 1}
                </span>
                {i < STEPS.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 bg-gradient-to-r from-brand/40 to-transparent lg:block" />}
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="roadmap" className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 pt-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow">Where we&rsquo;re headed</p>
          <h2 className="h-section mt-3">What we&rsquo;re aiming to build</h2>
          <p className="mt-3 text-lg text-muted">Veyro is just getting started. Here&rsquo;s what&rsquo;s live today and what&rsquo;s next.</p>
        </div>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {ROADMAP.map((r) => (
            <li key={r.stage} className={`card p-6 ${r.live ? "border-brand-200 shadow-[inset_0_3px_0_#0056d2,0_28px_50px_-24px_rgb(0_65_168/0.35)]" : ""}`}>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  r.live ? "bg-success-50 text-success" : "bg-soft text-muted"
                }`}
              >
                {r.stage}
              </span>
              <h3 className="mt-4 text-lg font-bold tracking-[-0.01em]">{r.title}</h3>
              <ul className="mt-3 space-y-2">
                {r.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-muted">
                    <CheckIcon className={`h-4 w-4 ${r.live ? "text-success" : "text-[#a9b4c7]"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 w-full max-w-7xl px-4 sm:px-6">
        <div className="surface-blue relative overflow-hidden rounded-[1.75rem] px-6 py-16 shadow-[0_40px_80px_-40px_rgb(0_65_168/0.7)] sm:px-14">
          <div aria-hidden="true" className="absolute -right-20 -top-28 h-80 w-80 rounded-full border border-white/20" />
          <div aria-hidden="true" className="absolute -right-4 -top-12 h-48 w-48 rounded-full border border-white/10" />
          <div className="relative max-w-2xl">
            <p className="eyebrow eyebrow-light">Start today</p>
            <h2 className="h-section mt-3">
              Take the next step toward your <em className="text-accent-gradient-light">learning goals</em>
            </h2>
            <p className="mt-4 text-lg text-white/80">Join Veyro today and start learning for free. We&rsquo;ll keep your place in every course.</p>
            <Link href="/sign-up" className="btn btn-white btn-lg mt-8">
              Join for Free
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

// ---------------------------------------------------------------- sections

async function HeroOrWelcome() {
  const user = await getCurrentUser()
  if (!user) return <HeroSignedOut />
  const mine = await listMyCourses(user.id)
  const current = mine.find((m) => m.status === "active")

  return (
    <section className="border-b border-[#ebe6dd]">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6">
        <h1 className="h-display !text-[clamp(1.9rem,1.4rem+2vw,2.75rem)]">Welcome back, {firstName(user)}</h1>
        {current ? (
          <div className="card mt-6 grid items-center gap-5 p-4 sm:grid-cols-[200px_minmax(0,1fr)_auto] sm:p-5">
            <div className="aspect-[16/9] overflow-hidden rounded-md">
              <CourseCover motif={current.course.coverMotif} tone={current.course.coverTone} seed={current.course.slug} rounded={false} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-dark">Continue learning</p>
              <p className="mt-0.5 text-xl font-semibold">{current.course.title}</p>
              {current.lastLessonTitle && <p className="mt-1 truncate text-muted">{current.lastLessonTitle}</p>}
              <div className="mt-3 flex max-w-md items-center gap-3">
                <ProgressBar className="flex-1" done={current.done} total={current.total} />
                <span className="text-sm text-muted">{current.total ? Math.round((current.done / current.total) * 100) : 0}%</span>
              </div>
            </div>
            <Link href={current.resumeHref} className="btn btn-primary">
              Resume
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-lg text-muted">
            Ready to start something new?{" "}
            <Link href="/courses" className="link">
              Browse courses
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}

const HERO_POINTS = [
  { icon: LockIcon, label: "Free during early access" },
  { icon: CardIcon, label: "No credit card" },
  { icon: CheckIcon, label: "Progress saved on every lesson" },
]

const HERO_FEATURES = [
  { icon: ReadIcon, title: "Expert instructors", body: "Learn from the best", tone: "bg-[#eaf1ff] text-[#2f6fdb]" },
  { icon: PlayIcon, title: "Practical learning", body: "Apply new skills", tone: "bg-[#e5f6ee] text-[#17845f]" },
  { icon: AwardIcon, title: "Certificate included", body: "Showcase your skills", tone: "bg-[#fff3df] text-[#c07a12]" },
  { icon: ClockIcon, title: "Learn at your pace", body: "Anytime, anywhere", tone: "bg-[#f1ebff] text-[#7a4fd6]" },
]

function HeroSignedOut() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative lg:min-h-[42rem]">
        {/* Photo: full-bleed on the right, fading into the page on its left edge. */}
        <div className="absolute inset-y-0 right-0 hidden w-[62%] lg:block">
          <Image
            src="/hero-learner.jpg"
            alt="A smiling learner with headphones taking notes in front of a laptop"
            fill
            priority
            sizes="62vw"
            className="object-cover object-[65%_center]"
          />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[45%] bg-gradient-to-r from-[#faf9f7] via-[#faf9f7]/70 to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#faf9f7]/50 to-transparent" />
          <HeroProgressCard className="absolute right-[3vw] top-[4.5rem] w-[15.5rem]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 md:pt-16 lg:pb-24 lg:pt-[4.5rem]">
          <div className="max-w-[37rem]">
            <h1 className="h-display text-navy [text-wrap:wrap]">
              Learn skills <br className="hidden sm:block" />
              <em className="text-serif-accent">that last</em>, at your <br className="hidden sm:block" />
              own pace
            </h1>
            <p className="mt-7 max-w-[46ch] text-xl leading-relaxed text-muted">
              Structured courses in mindset, marketing, editing and coding, with practice in every class and a
              certificate when you finish.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/sign-up" className="btn btn-primary btn-lg">
                Join for Free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link href="/courses" className="btn btn-outline btn-lg">
                Explore courses
              </Link>
            </div>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {HERO_POINTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-[0.98rem] font-medium text-muted">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-white text-navy shadow-[0_4px_12px_-8px_rgb(11_23_54/0.4)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Phones and tablets: the photo sits under the text. */}
        <div className="relative aspect-[3/2] w-full lg:hidden">
          <Image
            src="/hero-learner.jpg"
            alt="A smiling learner with headphones taking notes in front of a laptop"
            fill
            sizes="100vw"
            className="object-cover object-[60%_center]"
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#faf9f7] to-transparent" />
          <HeroProgressCard compact className="absolute bottom-4 left-4 w-[12rem] sm:bottom-6 sm:left-6 sm:w-[14rem]" />
        </div>
      </div>

      <div className="relative border-y border-[#ebe6dd] bg-white/45">
        <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-x-6 gap-y-5 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:py-8">
          {HERO_FEATURES.map(({ icon: Icon, title, body, tone }) => (
            <li key={title} className="flex items-center gap-4 lg:justify-center">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-ink">{title}</span>
                <span className="block text-sm text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Example progress card floating over the hero photo. */
function HeroProgressCard({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-2xl bg-white/95 shadow-[0_24px_50px_-24px_rgb(11_23_54/0.45)] ring-1 ring-black/5 backdrop-blur ${compact ? "p-3.5" : "p-5"} ${className}`}
    >
      <div className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
        <span className={`flex shrink-0 ${compact ? "h-10 w-10" : "h-12 w-12"} items-center justify-center rounded-full bg-gradient-to-br from-[#2f7bff] to-[#0047b8] text-white shadow-[0_8px_18px_-8px_rgb(0_86_210/0.8)]`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
            <path d="M12 3 1.5 8.5 12 14l8.5-4.45V16H22V8.5z" />
            <path d="M5.5 12.2v3.6c0 1.6 2.9 3.2 6.5 3.2s6.5-1.6 6.5-3.2v-3.6L12 15.6z" />
          </svg>
        </span>
        <span>
          <span className="block text-xs font-medium text-muted">Your progress</span>
          <span className={`font-display block font-extrabold leading-tight tracking-[-0.03em] text-navy ${compact ? "text-2xl" : "text-[1.75rem]"}`}>78%</span>
          <span className="block text-xs text-muted">12 of 16 lessons</span>
        </span>
      </div>
      <div className={`h-2 overflow-hidden rounded-full bg-brand-50 ${compact ? "mt-3" : "mt-4"}`}>
        <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#0056d2] to-[#2f7bff]" />
      </div>
    </div>
  )
}

// Total students shown on the home page ("10,000+"). Keep this to your real total: it can include
// learners from your coaching and other channels, not only accounts on this site.
const STUDENT_COUNT = 10_000

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="7.5" cy="6.5" r="2.8" />
      <path d="M2.5 16.5c.5-2.9 2.5-4.6 5-4.6s4.5 1.7 5 4.6" />
      <path d="M13 3.9a2.8 2.8 0 0 1 0 5.3M14.6 12.2c1.6.6 2.6 2.1 2.9 4.3" />
    </svg>
  )
}

async function Stats() {
  const [courses, categories] = await Promise.all([listCourses(), listCategories()])
  const lessons = courses.reduce((s, c) => s + c.lessonCount, 0)
  const seconds = courses.reduce((s, c) => s + c.durationSec, 0)
  const stats: {
    value: number
    kind?: CountKind
    label: string
    icon: (p: { className?: string }) => React.ReactNode
    featured?: boolean
  }[] = [
    { value: STUDENT_COUNT, kind: "plus", label: "students learning with us", icon: UsersIcon, featured: true },
    { value: courses.length, label: courses.length === 1 ? "course to choose from" : "courses to choose from", icon: LayersIcon },
    { value: lessons, label: "classes with practice", icon: PenIcon },
    { value: seconds, kind: "duration", label: "of learning content", icon: ClockIcon },
    { value: categories.length, label: categories.length === 1 ? "subject" : "subjects", icon: TargetIcon },
  ]
  return (
    <section aria-label="Veyro in numbers" className="relative z-10 mx-auto mt-14 w-full max-w-7xl px-4 sm:px-6">
      <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
        {stats.map(({ value, kind, label, icon: Icon, featured }) => (
          <li
            key={label}
            className={`card card-hover relative overflow-hidden p-5 sm:p-6 ${
              featured ? "surface-blue col-span-2 !border-transparent shadow-[0_30px_60px_-30px_rgb(0_65_168/0.7)] lg:col-span-1" : ""
            }`}
          >
            <span
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${
                featured ? "bg-white/15 text-white ring-1 ring-white/25" : "icon-tile"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <CountUp
              value={value}
              kind={kind}
              className={`font-display relative mt-5 block whitespace-nowrap text-[2rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2.3rem] lg:text-[2rem] xl:text-[2.3rem] ${
                featured ? "text-white" : "text-accent-gradient"
              }`}
            />
            <span className={`relative mt-2 block text-sm font-medium ${featured ? "text-white/80" : "text-muted"}`}>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

async function Categories() {
  const [categories, courses] = await Promise.all([listCategories(), listCourses()])
  const icons: Record<string, (p: { className?: string }) => React.ReactNode> = {
    mindset: TargetIcon,
    marketing: ChartIcon,
    editing: PlayIcon,
    coding: LayersIcon,
  }
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {categories.map((c) => {
        const Icon = icons[c.slug] ?? ReadIcon
        const count = courses.filter((x) => x.category?.slug === c.slug).length
        return (
          <Link key={c.slug} href={`/courses?category=${c.slug}`} className="card card-hover group flex items-center gap-4 p-5">
            <span className="icon-tile h-12 w-12 shrink-0">
              <Icon className="h-6 w-6" />
            </span>
            <span>
              <span className="block font-semibold transition-colors group-hover:text-brand">{c.name}</span>
              <span className="block text-sm text-muted">{count === 1 ? "1 course" : `${count} courses`}</span>
            </span>
          </Link>
        )
      })}
      <Link href="/courses" className="card card-hover surface-blue group flex items-center justify-between gap-4 !border-brand p-5">
        <span className="relative font-semibold text-white">View all courses</span>
        <ArrowRightIcon className="relative h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  )
}

async function PopularCourses() {
  const courses = await listCourses()
  if (!courses.length) return <p className="text-muted">No courses are published yet. Check back soon.</p>
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {courses.slice(0, 8).map((c, i) => (
        <CourseCard key={c.id} course={c} priority={i < 4} />
      ))}
    </div>
  )
}
