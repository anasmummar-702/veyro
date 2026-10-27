"""Generate supabase/seed.sql from the course files in this folder.

Edit a course file (mindset.py, marketing.py, editing.py, coding.py), then run:

    python supabase/curriculum/build_seed.py supabase/seed.sql
"""
import importlib.util
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
OUT = pathlib.Path(sys.argv[1])

COURSES = []
for name in ["mindset", "marketing", "editing", "coding"]:
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    COURSES.append(mod.COURSE)

CATEGORIES = [("mindset", "Mindset", 1), ("marketing", "Marketing", 2), ("editing", "Editing", 3), ("coding", "Coding", 4)]
OLD_SLUGS = ["neural-networks-visually", "linear-algebra-geometrically", "calculus-first-principles", "study-skills-that-stick"]
OLD_CATS = ["data-ai", "mathematics", "learning-skills"]


def q(s: str) -> str:
    return "'" + s.replace("'", "''") + "'"


def dq(s: str) -> str:
    assert "$md$" not in s
    return "$md$" + s.strip() + "$md$"


# sanity checks
for c in COURSES:
    assert len(c["modules"]) == 5, c["slug"]
    for m in c["modules"]:
        assert len(m["lessons"]) == 4, (c["slug"], m["title"])
        assert len(m["title"]) <= 140
        for t, mins, body in m["lessons"]:
            assert len(t) <= 160 and 1 <= mins <= 60 and len(body) > 400, t
    assert len(c["title"]) <= 140 and len(c["subtitle"]) <= 220, c["slug"]

parts = []
parts.append(f"""-- Veyro course catalog: Mindset, Marketing, Editing and Coding.
-- Generated from the curriculum source files; every lesson is original Veyro text.
-- Safe to re-run: removes the old demo courses if present, and exits early if
-- the current catalog already exists.

do $seed$
declare
  v_instructor uuid;
begin
  -- Retire the original demo catalog (only if nobody is enrolled in it).
  delete from public.courses c
  where c.slug in ({", ".join(q(s) for s in OLD_SLUGS)})
    and not exists (select 1 from public.enrollments e where e.course_id = c.id);
  delete from public.categories cat
  where cat.slug in ({", ".join(q(s) for s in OLD_CATS)})
    and not exists (select 1 from public.courses c where c.category_slug = cat.slug);

  if exists (select 1 from public.courses where slug = {q(COURSES[0]["slug"])}) then
    raise notice 'Course catalog already present — skipping.';
    return;
  end if;

  -- Editorial account that owns curated courses. It has no password and
  -- cannot sign in; it exists so courses have an owner.
  select id into v_instructor from auth.users where email = 'editorial@veyro.local';
  if v_instructor is null then
    v_instructor := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_instructor, 'authenticated', 'authenticated',
      'editorial@veyro.local', '', now(),
      '{{"provider":"email","providers":["email"]}}', '{{"full_name":"Veyro Editorial"}}', now(), now(),
      '', '', '', ''
    );
  end if;

  update public.profiles
  set role = 'instructor',
      full_name = 'Veyro',
      headline = 'Structured courses in mindset, marketing, editing and coding'
  where id = v_instructor;

  insert into public.categories (slug, name, sort_order) values
    {(","+chr(10)+"    ").join(f"({q(s)}, {q(n)}, {o})" for s, n, o in CATEGORIES)}
  on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;
""")

# courses, staggered publish times so the catalog keeps this order (newest first = Mindset)
rows = []
for i, c in enumerate(COURSES):
    outcomes = "array[" + ",\n         ".join(q(o) for o in c["outcomes"]) + "]"
    rows.append(
        f"""  (v_instructor, {q(c['slug'])},
   {q(c['title'])},
   {q(c['subtitle'])},
   {q(c['description'])},
   {outcomes},
   {q(c['level'])}, {q(c['category'])}, {q(c['motif'])}, {q(c['tone'])}, 'published', now() - interval '{i} minutes')"""
    )
parts.append(
    """  insert into public.courses
    (instructor_id, slug, title, subtitle, description, outcomes, level, category_slug, cover_motif, cover_tone, status, published_at)
  values
"""
    + ",\n\n".join(rows)
    + ";\n"
)

# modules
mrows = []
for c in COURSES:
    for mi, m in enumerate(c["modules"]):
        mrows.append(f"    ({q(c['slug'])}, {mi}, {q(m['title'])}, {q(m['description'])})")
parts.append(
    """
  create temp table seed_modules (slug text, pos int, title text, descr text) on commit drop;
  insert into seed_modules values
"""
    + ",\n".join(mrows)
    + """;

  insert into public.modules (course_id, title, description, position)
  select c.id, m.title, m.descr, m.pos
  from seed_modules m join public.courses c on c.slug = m.slug;

  create temp table seed_lessons (
    slug text, mpos int, lpos int, title text, preview boolean, dur int, body text
  ) on commit drop;

  insert into seed_lessons values
"""
)

lrows = []
for c in COURSES:
    lrows.append(f"  -- {c['title']} " + "-" * max(3, 70 - len(c["title"])))
    for mi, m in enumerate(c["modules"]):
        for li, (title, mins, body) in enumerate(m["lessons"]):
            preview = "true" if (mi == 0 and li < 2) else "false"
            lrows.append(f"  ({q(c['slug'])}, {mi}, {li}, {q(title)}, {preview}, {mins * 60},\n{dq(body)}),")
lrows[-1] = lrows[-1].rstrip(",") + ";"
parts.append("\n".join(lrows))

parts.append(
    """

  insert into public.lessons (module_id, course_id, title, type, position, is_preview, duration_sec)
  select mo.id, c.id, l.title, 'article'::public.lesson_type, l.lpos, l.preview, l.dur
  from seed_lessons l
  join public.courses c on c.slug = l.slug
  join public.modules mo on mo.course_id = c.id and mo.position = l.mpos;

  insert into public.lesson_contents (lesson_id, body_md)
  select le.id, l.body
  from seed_lessons l
  join public.courses c on c.slug = l.slug
  join public.modules mo on mo.course_id = c.id and mo.position = l.mpos
  join public.lessons le on le.module_id = mo.id and le.position = l.lpos;
end
$seed$;
"""
)

OUT.write_text("\n".join(parts))
n = sum(len(m["lessons"]) for c in COURSES for m in c["modules"])
mins = sum(x[1] for c in COURSES for m in c["modules"] for x in m["lessons"])
words = sum(len(x[2].split()) for c in COURSES for m in c["modules"] for x in m["lessons"])
print(f"{len(COURSES)} courses, {sum(len(c['modules']) for c in COURSES)} modules, {n} lessons, {mins} min, {words} words -> {OUT}")
