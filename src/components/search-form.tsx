import { SearchIcon } from "@/components/icons"

/** Plain GET form so search works without JavaScript and results are linkable. */
export function SearchForm({
  defaultValue = "",
  size = "lg",
  hidden,
}: {
  defaultValue?: string
  size?: "lg" | "md"
  hidden?: Record<string, string | undefined>
}) {
  const big = size === "lg"
  return (
    <form action="/courses" method="get" role="search" className="relative w-full">
      {Object.entries(hidden ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <label htmlFor={`search-${size}`} className="sr-only">
        Search courses
      </label>
      <SearchIcon className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint ${big ? "h-5 w-5" : "h-4 w-4"}`} />
      <input
        id={`search-${size}`}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search courses or topics"
        maxLength={100}
        className={`field rounded-xl pr-28 ${big ? "min-h-14 pl-12 text-[1.05rem]" : "pl-11"}`}
      />
      <button type="submit" className={`btn btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 ${big ? "min-h-11" : "min-h-9 px-4 py-1.5"}`}>
        Search
      </button>
    </form>
  )
}
