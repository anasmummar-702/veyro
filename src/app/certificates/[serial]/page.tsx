import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { CertificateArt, formatIssued } from "@/components/certificate"
import { ArrowLeftIcon, CheckIcon } from "@/components/icons"
import { verifyCertificate } from "@/lib/data"
import { CertificateActions } from "./certificate-actions"

export const metadata: Metadata = {
  title: "Certificate of completion",
  description: "A verified Veyro certificate of completion.",
}

export default function CertificatePage({ params }: PageProps<"/certificates/[serial]">) {
  return (
    <div className="flex-1 bg-soft print:bg-white">
      {/* Print the certificate alone, on one landscape page. */}
      <style>{`@media print { @page { size: A4 landscape; margin: 0; } html, body { background: #fff !important; } }`}</style>
      <Suspense fallback={<CertificateSkeleton />}>
        <CertificateView params={params} />
      </Suspense>
    </div>
  )
}

function CertificateSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="skeleton h-5 w-40" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="skeleton aspect-[1123/794]" />
        <div className="skeleton h-72" />
      </div>
    </div>
  )
}

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")
  return `${proto}://${host}`
}

async function CertificateView({ params }: { params: Promise<{ serial: string }> }) {
  const { serial } = await params
  const [cert, origin] = await Promise.all([verifyCertificate(decodeURIComponent(serial)), siteOrigin()])
  if (!cert) notFound()

  const url = `${origin}/certificates/${cert.serial}`
  const shortUrl = url.replace(/^https?:\/\//, "")

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 print:max-w-none print:p-0">
      <Link href="/certificates" className="link inline-flex items-center gap-2 text-sm print:hidden">
        <ArrowLeftIcon className="h-4 w-4" />
        My certificates
      </Link>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] print:mt-0 print:block">
        <div className="overflow-hidden rounded-2xl shadow-[0_1px_2px_rgb(11_23_54/0.06),0_40px_80px_-40px_rgb(10_31_68/0.45)] ring-1 ring-line print:rounded-none print:shadow-none print:ring-0">
          <CertificateArt cert={cert} verifyUrl={shortUrl} />
        </div>

        <aside className="card p-6 print:hidden">
          <p className="inline-flex items-center gap-2 rounded-full bg-success-50 px-3 py-1 text-sm font-semibold text-success">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
              <CheckIcon className="h-3 w-3" />
            </span>
            Verified certificate
          </p>
          <h1 className="mt-4 text-xl font-bold leading-snug tracking-[-0.01em]">{cert.courseTitle}</h1>
          <dl className="mt-4 space-y-3 text-[0.95rem]">
            <div>
              <dt className="text-sm text-muted">Awarded to</dt>
              <dd className="font-semibold">{cert.recipientName}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Issued</dt>
              <dd className="font-semibold">{formatIssued(cert.issuedAt)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Certificate ID</dt>
              <dd className="font-mono font-semibold tracking-wide">{cert.serial}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Veyro confirms this learner completed every class in the course. Anyone with this link can check that it&rsquo;s genuine.
          </p>
          <div className="mt-6">
            <CertificateActions url={url} />
          </div>
          <Link href={`/courses/${cert.courseSlug}`} className="link mt-6 inline-block text-sm">
            About this course
          </Link>
        </aside>
      </div>
    </div>
  )
}
