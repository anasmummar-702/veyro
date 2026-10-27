import { Suspense } from "react"
import { AdminNav, AdminNavFallback } from "@/app/admin/_components/admin-nav"
import { adminSignOut } from "@/app/admin/login/actions"

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div data-no-footer className="flex-1 bg-soft">
      <div className="mx-auto grid w-full max-w-[96rem] lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="border-b border-line bg-white lg:min-h-[calc(100svh-4.75rem)] lg:border-b-0 lg:border-r">
          <div className="lg:sticky lg:top-[4.75rem] lg:flex lg:h-[calc(100svh-4.75rem)] lg:flex-col">
            <Suspense fallback={<AdminNavFallback />}>
              <AdminNav />
            </Suspense>
            <form action={adminSignOut} className="hidden border-t border-line p-3 lg:mt-auto lg:block">
              <button type="submit" className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-muted hover:bg-soft hover:text-ink">
                Sign out of admin
              </button>
            </form>
          </div>
        </aside>
        <div className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">{children}</div>
      </div>
    </div>
  )
}
