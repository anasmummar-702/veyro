import type { Metadata, Viewport } from "next"
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google"
import "@fontsource-variable/source-sans-3"
import "./globals.css"
import { SiteFooter, SiteHeader } from "@/components/site-header"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

// Only used for a few italic accents, so load just the italic and don't preload it on every page.
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: { default: "Veyro | Online courses, free to start", template: "%s | Veyro" },
  description:
    "Learn mindset, marketing, editing and coding with structured courses: clear classes, practice in every lesson, saved progress and a certificate when you finish.",
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full ${jakarta.variable} ${instrument.variable}`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:text-white focus:px-4 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="relative flex flex-1 flex-col overflow-x-clip">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  )
}
