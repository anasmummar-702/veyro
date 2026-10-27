import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { CertificateArt, formatIssued } from "@/components/certificate"
import { AwardIcon } from "@/components/icons"
import { ProgressBar } from "@/components/progress-bar"
import { requireUser } from "@/lib/auth"
import { listMyCertificates, listMyCourses } from "@/lib/data"

export const metadata: Metadata = { title: "My certificates" }

export default function CertificatesPage() {
  return (
    <>
      <div className="border-b border-line bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className="eyebrow">Achievements</p>
          <h1 className="h-display mt-4 !text-[clamp(2rem,1.5rem+2vw,2.8rem)]">My certificates</h1>
          <p className="mt-3 max-w-[56ch] text-lg text-muted">
            Finish every class in a course and your certificate of completion appears here, ready to download and share.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Suspense fallback={<Skeleton />}>
          <Certificates />
        </Suspense>
      </div>
    </>
  )
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="card p-3">
          <div className="skeleton aspect-[1123/794]" />
          <div className="skeleton mt-4 h-5 w-3/4" />
        </div>
      ))}
    </div>
  )
}

async function Certificates() {
  const user = await requireUser("/certificates")
  const [certs, courses] = await Promise.all([listMyCertificates(), listMyCourses(user.id)])
  const earned = new Set(certs.map((c) => c.courseSlug))
  const inProgress = courses.filter((c) => c.status === "active" && !earned.has(c.course.slug))

  return (
    <>
      <section aria-labelledby="earned-heading">
        <h2 id="earned-heading" className="text-xl font-bold tracking-[-0.01em]">
          Earned <span className="ml-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand">{certs.length}</span>
        </h2>
        {certs.length ? (
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((c) => (
              <li key={c.serial} className="card card-hover group relative p-3">
                <div className="overflow-hidden rounded-lg ring-1 ring-line">
                  <CertificateArt cert={c} />
                </div>
                <div className="px-1 pb-1 pt-4">
                  <h3 className="font-bold leading-snug">
                    <Link href={`/certificates/${c.serial}`} className="after:absolute after:inset-0 group-hover:text-brand">
                      {c.courseTitle}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted">Issued {formatIssued(c.issuedAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="card mt-5 flex flex-col items-center p-10 text-center">
            <span className="icon-tile-solid h-14 w-14">
              <AwardIcon className="h-6 w-6" />
            </span>
            <p className="mt-5 text-xl font-semibold">No certificates yet</p>
            <p className="mt-2 max-w-[46ch] text-muted">
              Complete every class in a course to earn your first certificate. Your progress is saved on every lesson.
            </p>
            <Link href={inProgress.length ? "/my-learning" : "/courses"} className="btn btn-primary mt-6">
              {inProgress.length ? "Continue learning" : "Explore courses"}
            </Link>
          </div>
        )}
      </section>

      {inProgress.length > 0 && (
        <section aria-labelledby="progress-heading" className="mt-14">
          <h2 id="progress-heading" className="text-xl font-bold tracking-[-0.01em]">
            Working toward
          </h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {inProgress.map((c) => {
              const left = c.total - c.done
              return (
                <li key={c.enrollmentId} className="card flex items-center gap-5 p-5">
                  <span className="icon-tile h-12 w-12 shrink-0">
                    <AwardIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.course.title}</p>
                    <ProgressBar className="mt-2" done={c.done} total={c.total} label={`${c.course.title} progress`} />
                    <p className="mt-1.5 text-sm text-muted">
                      {left === 1 ? "1 class left" : `${left} classes left`} to unlock your certificate
                    </p>
                  </div>
                  <Link href={c.resumeHref} className="btn btn-outline shrink-0">
                    {c.done ? "Resume" : "Start"}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </>
  )
}
