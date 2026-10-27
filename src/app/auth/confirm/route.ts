import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { safeNext } from "@/lib/auth"

// Token-hash email links. Unlike the PKCE /auth/callback flow, these work even
// when the email is opened on a different device. To use them, set the Supabase
// email templates to:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/my-learning
const OTP_TYPES: EmailOtpType[] = ["signup", "email", "recovery", "invite", "magiclink", "email_change"]

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const next = safeNext(searchParams.get("next"))

  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      const dest = type === "recovery" ? "/account/update-password" : next
      return NextResponse.redirect(new URL(dest, origin))
    }
  }

  const failed = new URL("/sign-in", origin)
  failed.searchParams.set("error", "link")
  return NextResponse.redirect(failed)
}
