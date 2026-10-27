import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/env"

// Pages that only make sense for a signed-in learner. Data is still protected
// by RLS; this just sends visitors to sign in instead of an empty page.
const SIGNED_IN_ONLY = ["/my-learning", "/account"]
// Exact paths only: /certificates/<serial> stays public so certificates can be shared and verified.
const SIGNED_IN_ONLY_EXACT = ["/certificates"]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return response

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  // Refreshes an expiring session and validates the token.
  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims?.sub)

  const { pathname, search } = request.nextUrl
  const needsSignIn =
    SIGNED_IN_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`)) || SIGNED_IN_ONLY_EXACT.includes(pathname)
  if (!signedIn && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  if (!signedIn && needsSignIn) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    const redirect = NextResponse.redirect(url)
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c))
    return redirect
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)"],
}
