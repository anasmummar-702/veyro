/** Split screen: a photo on the left half, the form on the right half. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div data-no-footer className="grid flex-1 lg:min-h-[calc(100svh-4.75rem)] lg:grid-cols-2">
      {/* image half */}
      <aside className="relative hidden overflow-hidden bg-brand-100 lg:block">
        {/* Photo: Vitaly Gariev on Unsplash (free to use under the Unsplash License) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1752650735119-8929e5f7d1ec?auto=format&fit=crop&w=1600&q=80"
          alt="A smiling student working on her laptop"
          className="absolute inset-0 h-full w-full object-cover object-[30%_center]"
          loading="eager"
          decoding="async"
        />
        {/* soft blue tint so the photo sits with the brand colours */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-[#0a1f44]/25 via-transparent to-[#2f7bff]/10" />
      </aside>

      {/* form half */}
      <div className="flex items-center justify-center bg-white px-4 py-12 sm:px-8 lg:py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
