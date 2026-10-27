import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CourseCard, CourseGridSkeleton } from "@/components/course-card"
import { CheckIcon, SearchIcon } from "@/components/icons"
import { listCategories, listCourses } from "@/lib/data"
import { LEVEL_LABEL } from "@/lib/format"

export const metadata: Metadata = { title: "Explore courses" }

type Filters = { q: string; category: string; level: string }

function toFilters(p: Record<string, string | string[] | undefined>): Filters {
  const s = (v: unknown) => (typeof v === "string" ? v : "")
  return { q: s(p.q).slice(0, 100), category: s(p.category), level: s(p.level) }
}

export default function CoursesPage({ searchParams }: PageProps<"/courses">) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog filters={searchParams.then(toFilters)} />
      </Suspense>
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="skeleton hidden h-96 lg:block" />
      <div>
        <div className="skeleton h-8 w-72" />
        <div className="mt-6">
          <CourseGridSkeleton count={6} />
        </div>
      </div>
    </div>
  )
}

function hrefWith(f: Filters, patch: Partial<Filters>) {
  const next = { ...f, ...patch }
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v)
  const s = qs.toString()
  return s ? `/courses?${s}` : "/courses"
}

function FilterOption({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined} className="group flex items-center gap-3 rounded py-1.5">
      <span
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[3px] border ${
          active ? "border-brand bg-brand text-white" : "border-[#6b7589] bg-white group-hover:border-ink"
        }`}
      >
        {active && <CheckIcon className="h-3 w-3" />}
      </span>
      <span className={active ? "font-semibold" : ""}>{label}</span>
      {count !== undefined && <span className="text-sm text-muted">({count})</span>}
    </Link>
  )
}

async function Catalog({ filters }: { filters: Promise<Filters> }) {
  const f = await filters
  const [categories, courses, all] = await Promise.all([listCategories(), listCourses(f), listCourses()])
  const hasFilters = Boolean(f.q || f.category || f.level)
  const activeCategory = categories.find((c) => c.slug === f.category)

  return (
    <>
      <form action="/courses" method="get" role="search" className="relative max-w-2xl">
        {f.category && <input type="hidden" name="category" value={f.category} />}
        {f.level && <input type="hidden" name="level" value={f.level} />}
        <label htmlFor="catalog-search" className="sr-only">
          Search courses
        </label>
        <input
          id="catalog-search"
          name="q"
          type="search"
          defaultValue={f.q}
          placeholder="What do you want to learn?"
          maxLength={100}
          className="field min-h-12 rounded-full pl-5 pr-14 text-lg"
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white hover:bg-brand-dark"
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-8 grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside aria-label="Filters">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filter by</h2>
            {hasFilters && (
              <Link href={f.q ? `/courses?q=${encodeURIComponent(f.q)}` : "/courses"} className="link text-sm">
                Clear all
              </Link>
            )}
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <fieldset className="border-t border-line pt-4">
              <legend className="sr-only">Subject</legend>
              <p className="mb-2 font-semibold">Subject</p>
              {categories.map((c) => (
                <FilterOption
                  key={c.slug}
                  href={hrefWith(f, { category: f.category === c.slug ? "" : c.slug })}
                  active={f.category === c.slug}
                  label={c.name}
                  count={all.filter((x) => x.category?.slug === c.slug).length}
                />
              ))}
            </fieldset>
            <fieldset className="border-t border-line pt-4">
              <legend className="sr-only">Level</legend>
              <p className="mb-2 font-semibold">Level</p>
              {(Object.keys(LEVEL_LABEL) as (keyof typeof LEVEL_LABEL)[]).map((lvl) => (
                <FilterOption
                  key={lvl}
                  href={hrefWith(f, { level: f.level === lvl ? "" : lvl })}
                  active={f.level === lvl}
                  label={LEVEL_LABEL[lvl]}
                  count={all.filter((x) => x.level === lvl).length}
                />
              ))}
            </fieldset>
            <fieldset className="border-t border-line pt-4">
              <legend className="sr-only">Price</legend>
              <p className="mb-2 font-semibold">Price</p>
              <p className="flex items-center gap-3 py-1.5">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] border border-brand bg-brand text-white">
                  <CheckIcon className="h-3 w-3" />
                </span>
                Free <span className="text-sm text-muted">({all.length})</span>
              </p>
            </fieldset>
          </div>
        </aside>

        <div className="min-w-0">
          <h1 className="text-2xl font-semibold" role="status">
            {courses.length === 1 ? "1 result" : `${courses.length} results`}
            {f.q ? <> for &ldquo;{f.q}&rdquo;</> : activeCategory ? <> in {activeCategory.name}</> : <> — all courses</>}
          </h1>
          {courses.length ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <div className="card mt-6 p-8">
              <p className="text-lg font-semibold">No results match your search</p>
              <ul className="mt-2 list-disc pl-5 text-muted">
                <li>Check your spelling, or try a more general term</li>
                <li>Remove a filter to see more courses</li>
              </ul>
              <Link href="/courses" className="btn btn-outline mt-6">
                See all courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
