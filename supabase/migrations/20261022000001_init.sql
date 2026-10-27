-- Veyro: initial schema — identity, catalog, curriculum, enrollment, progress.
-- Rules enforced here (not in the browser):
--   * students can only read their own enrollments/progress
--   * lesson content (video ref / article body) is readable only by enrolled
--     learners, preview lessons, or the course owner/admin
--   * enrollment and progress are written only through SECURITY DEFINER RPCs
--     that validate ownership, enrollment and plausibility.

-- ---------------------------------------------------------------- types
create type public.app_role          as enum ('student', 'instructor', 'admin');
create type public.course_status     as enum ('draft', 'published', 'archived');
create type public.course_level      as enum ('beginner', 'intermediate', 'advanced');
create type public.lesson_type       as enum ('video', 'article', 'quiz');
create type public.enrollment_status as enum ('active', 'completed', 'cancelled');

create schema if not exists private;

-- ---------------------------------------------------------------- tables
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 120),
  headline    text check (char_length(headline) <= 160),
  role        public.app_role not null default 'student',
  status      text not null default 'active' check (status in ('active', 'suspended')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.categories (
  slug        text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  sort_order  int  not null default 0
);

create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  instructor_id  uuid not null references public.profiles (id) on delete restrict,
  title          text not null check (char_length(title) between 3 and 140),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  subtitle       text check (char_length(subtitle) <= 220),
  description    text not null default '',
  outcomes       text[] not null default '{}',
  level          public.course_level not null default 'beginner',
  category_slug  text references public.categories (slug) on update cascade,
  language       text not null default 'English',
  cover_motif    text not null default 'grid'
                 check (cover_motif in ('grid', 'network', 'curve', 'lines', 'orbit')),
  cover_tone     text not null default 'lapis'
                 check (cover_tone in ('lapis', 'ink', 'moss', 'plum', 'rust')),
  status         public.course_status not null default 'draft',
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  search         tsvector generated always as (
                   to_tsvector('english',
                     coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, ''))
                 ) stored
);

create table public.modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 140),
  description  text,
  position     int  not null check (position >= 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (id, course_id),
  constraint modules_course_position_key unique (course_id, position) deferrable initially deferred
);

create table public.lessons (
  id            uuid primary key default gen_random_uuid(),
  module_id     uuid not null,
  course_id     uuid not null references public.courses (id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 160),
  type          public.lesson_type not null,
  position      int  not null check (position >= 0),
  is_required   boolean not null default true,
  is_preview    boolean not null default false,
  duration_sec  int  not null default 0 check (duration_sec between 0 and 43200),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- lesson.course_id must match its module's course
  foreign key (module_id, course_id) references public.modules (id, course_id) on delete cascade,
  constraint lessons_module_position_key unique (module_id, position) deferrable initially deferred
);

-- Content is split from lesson metadata so the curriculum outline can be public
-- while the actual material requires enrollment.
create table public.lesson_contents (
  lesson_id       uuid primary key references public.lessons (id) on delete cascade,
  body_md         text,
  video_provider  text check (video_provider in ('youtube')),
  video_ref       text check (video_ref ~ '^[A-Za-z0-9_-]{6,32}$'),
  attribution     text,
  updated_at      timestamptz not null default now(),
  check ((video_provider is null) = (video_ref is null))
);

create table public.enrollments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  course_id         uuid not null references public.courses (id) on delete restrict,
  status            public.enrollment_status not null default 'active',
  enrolled_at       timestamptz not null default now(),
  completed_at      timestamptz,
  last_lesson_id    uuid references public.lessons (id) on delete set null,
  last_activity_at  timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  lesson_id          uuid not null references public.lessons (id) on delete cascade,
  course_id          uuid not null references public.courses (id) on delete cascade,
  enrollment_id      uuid not null references public.enrollments (id) on delete cascade,
  last_position_sec  numeric(9, 1) not null default 0 check (last_position_sec >= 0),
  watched_intervals  jsonb not null default '[]'::jsonb check (jsonb_typeof(watched_intervals) = 'array'),
  watched_sec        int  not null default 0 check (watched_sec >= 0),
  is_completed       boolean not null default false,
  completed_at       timestamptz,
  rejected_reports   int  not null default 0,
  last_reported_at   timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, lesson_id)
);

-- ---------------------------------------------------------------- indexes
create index courses_status_published_idx on public.courses (status, published_at desc);
create index courses_instructor_idx       on public.courses (instructor_id);
create index courses_category_idx         on public.courses (category_slug);
create index courses_search_idx           on public.courses using gin (search);
create index modules_course_idx           on public.modules (course_id);
create index lessons_course_idx           on public.lessons (course_id);
create index enrollments_user_idx         on public.enrollments (user_id, last_activity_at desc);
create index enrollments_course_idx       on public.enrollments (course_id);
create index enrollments_last_lesson_idx  on public.enrollments (last_lesson_id);
create index progress_user_course_idx     on public.lesson_progress (user_id, course_id);
create index progress_lesson_idx          on public.lesson_progress (lesson_id);
create index progress_course_idx          on public.lesson_progress (course_id);
create index progress_enrollment_idx      on public.lesson_progress (enrollment_id);

-- ---------------------------------------------------------------- housekeeping triggers
create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_touch        before update on public.profiles        for each row execute function private.touch_updated_at();
create trigger courses_touch         before update on public.courses         for each row execute function private.touch_updated_at();
create trigger modules_touch         before update on public.modules         for each row execute function private.touch_updated_at();
create trigger lessons_touch         before update on public.lessons         for each row execute function private.touch_updated_at();
create trigger lesson_contents_touch before update on public.lesson_contents for each row execute function private.touch_updated_at();
create trigger progress_touch        before update on public.lesson_progress for each row execute function private.touch_updated_at();

create or replace function private.set_published_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

create trigger courses_published_at before insert or update of status on public.courses
  for each row execute function private.set_published_at();

-- New auth user -> profile (role is always 'student'; promotion is an admin action).
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120))
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ---------------------------------------------------------------- access helpers
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and status = 'active'
  );
$$;

create or replace function private.can_manage_course(p_course_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select (select private.is_admin()) or exists (
    select 1 from public.courses
    where id = p_course_id and instructor_id = (select auth.uid())
  );
$$;

create or replace function private.course_is_published(p_course_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.courses where id = p_course_id and status = 'published');
$$;

create or replace function private.is_enrolled(p_course_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.enrollments
    where course_id = p_course_id
      and user_id = (select auth.uid())
      and status in ('active', 'completed')
  );
$$;

create or replace function private.can_view_lesson_content(p_lesson_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.lessons l
    where l.id = p_lesson_id
      and (
        private.can_manage_course(l.course_id)
        or (private.course_is_published(l.course_id)
            and (l.is_preview or private.is_enrolled(l.course_id)))
      )
  );
$$;

-- Union of [start, end] second intervals; gaps under 1s are bridged.
create or replace function private.merge_intervals(p jsonb)
returns jsonb language sql immutable set search_path = '' as $$
  with iv as (
    select (x ->> 0)::numeric as s, (x ->> 1)::numeric as f
    from jsonb_array_elements(coalesce(p, '[]'::jsonb)) as x
  ),
  ordered as (
    select s, f,
           max(f) over (order by s, f rows between unbounded preceding and 1 preceding) as prev_max
    from iv
  ),
  grouped as (
    select s, f,
           sum(case when prev_max is null or s > prev_max + 1 then 1 else 0 end)
             over (order by s, f) as g
    from ordered
  )
  select coalesce(jsonb_agg(jsonb_build_array(round(lo, 1), round(hi, 1)) order by lo), '[]'::jsonb)
  from (select min(s) as lo, max(f) as hi from grouped group by g) t;
$$;

create or replace function private.interval_total(p jsonb)
returns numeric language sql immutable set search_path = '' as $$
  select coalesce(sum((x ->> 1)::numeric - (x ->> 0)::numeric), 0)
  from jsonb_array_elements(coalesce(p, '[]'::jsonb)) as x;
$$;

-- Course completion is derived from lesson facts and only ever advances.
create or replace function private.refresh_enrollment_completion(p_enrollment_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_course uuid;
  v_user uuid;
  v_required int;
  v_done int;
begin
  select course_id, user_id into v_course, v_user
  from public.enrollments where id = p_enrollment_id;

  select count(*) into v_required
  from public.lessons where course_id = v_course and is_required;

  select count(*) into v_done
  from public.lesson_progress p
  join public.lessons l on l.id = p.lesson_id
  where p.user_id = v_user and p.course_id = v_course and l.is_required and p.is_completed;

  if v_required > 0 and v_done >= v_required then
    update public.enrollments
    set status = 'completed', completed_at = coalesce(completed_at, now())
    where id = p_enrollment_id and status <> 'completed';
  end if;
end $$;

grant usage on schema private to anon, authenticated;
grant execute on function
  private.is_admin(), private.can_manage_course(uuid), private.course_is_published(uuid),
  private.is_enrolled(uuid), private.can_view_lesson_content(uuid)
  to anon, authenticated;
revoke execute on function
  private.refresh_enrollment_completion(uuid), private.handle_new_user()
  from public, anon, authenticated;

-- ---------------------------------------------------------------- RLS
alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.courses         enable row level security;
alter table public.modules         enable row level security;
alter table public.lessons         enable row level security;
alter table public.lesson_contents enable row level security;
alter table public.enrollments     enable row level security;
alter table public.lesson_progress enable row level security;

-- Writes go through RPCs only (plus a narrow profile self-edit).
revoke all on public.profiles, public.categories, public.courses, public.modules, public.lessons,
              public.lesson_contents, public.enrollments, public.lesson_progress
  from anon, authenticated;
grant select on public.profiles, public.categories, public.courses, public.modules, public.lessons,
               public.lesson_contents, public.enrollments, public.lesson_progress
  to anon, authenticated;
grant update (full_name, headline) on public.profiles to authenticated;

create policy "profiles: read self, published instructors, or admin" on public.profiles
  for select to anon, authenticated using (
    id = (select auth.uid())
    or (select private.is_admin())
    or exists (select 1 from public.courses c
               where c.instructor_id = profiles.id and c.status = 'published')
  );

create policy "profiles: edit own name and headline" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "categories: public" on public.categories
  for select to anon, authenticated using (true);

create policy "courses: published, own, or admin" on public.courses
  for select to anon, authenticated using (
    status = 'published'
    or instructor_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "modules: visible with course" on public.modules
  for select to anon, authenticated using (
    private.course_is_published(course_id) or private.can_manage_course(course_id)
  );

create policy "lessons: visible with course" on public.lessons
  for select to anon, authenticated using (
    private.course_is_published(course_id) or private.can_manage_course(course_id)
  );

create policy "lesson contents: enrolled, preview, or owner" on public.lesson_contents
  for select to anon, authenticated using (private.can_view_lesson_content(lesson_id));

create policy "enrollments: own or course owner" on public.enrollments
  for select to authenticated using (
    user_id = (select auth.uid()) or private.can_manage_course(course_id)
  );

create policy "progress: own or course owner" on public.lesson_progress
  for select to authenticated using (
    user_id = (select auth.uid()) or private.can_manage_course(course_id)
  );

-- ---------------------------------------------------------------- RPCs (student journey)

-- Idempotent enrollment in a published course.
create or replace function public.enroll_in_course(p_course_id uuid)
returns public.enrollments
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_row public.enrollments;
begin
  if v_uid is null then
    raise exception 'Sign in to enroll.' using errcode = '28000';
  end if;
  if not private.course_is_published(p_course_id) then
    raise exception 'This course is not open for enrollment.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and status <> 'active') then
    raise exception 'Your account is suspended.' using errcode = '42501';
  end if;

  insert into public.enrollments as e (user_id, course_id)
  values (v_uid, p_course_id)
  on conflict (user_id, course_id) do update
    set status = case when e.status = 'cancelled' then 'active'::public.enrollment_status else e.status end,
        last_activity_at = now()
  returning * into v_row;

  return v_row;
end $$;

-- Shared guard: returns the caller's enrollment for the lesson's course.
create or replace function private.require_lesson_enrollment(p_lesson_id uuid, out o_enrollment_id uuid, out o_course_id uuid)
language plpgsql stable security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Sign in to continue.' using errcode = '28000';
  end if;

  select e.id, l.course_id into o_enrollment_id, o_course_id
  from public.lessons l
  join public.courses c on c.id = l.course_id and c.status = 'published'
  join public.enrollments e on e.course_id = l.course_id and e.user_id = v_uid
                            and e.status in ('active', 'completed')
  where l.id = p_lesson_id;

  if o_enrollment_id is null then
    raise exception 'Enroll in this course to track progress.' using errcode = '42501';
  end if;
end $$;
revoke execute on function private.require_lesson_enrollment(uuid) from public, anon, authenticated;

-- Remember the lesson a learner opened, for "resume".
create or replace function public.open_lesson(p_lesson_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  g record;
begin
  select * into g from private.require_lesson_enrollment(p_lesson_id);
  update public.enrollments
  set last_lesson_id = p_lesson_id, last_activity_at = now()
  where id = g.o_enrollment_id;
end $$;

-- Video progress: client sends observed playback intervals since its last report.
-- Server merges, clamps to the lesson length, rejects implausible jumps in
-- coverage (more than 2x wall-clock time + slack), and decides completion.
create or replace function public.record_video_progress(
  p_lesson_id uuid,
  p_intervals jsonb,
  p_position numeric,
  p_player_duration numeric default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  g record;
  v_uid uuid := auth.uid();
  v_lesson public.lessons;
  v_row public.lesson_progress;
  v_len numeric;
  v_clean jsonb := '[]'::jsonb;
  v_item jsonb;
  v_s numeric;
  v_f numeric;
  v_merged jsonb;
  v_old numeric;
  v_new numeric;
  v_allowed numeric;
  v_accepted boolean := true;
  v_threshold numeric;
  v_completed boolean;
begin
  select * into g from private.require_lesson_enrollment(p_lesson_id);

  select * into v_lesson from public.lessons where id = p_lesson_id;
  if v_lesson.type <> 'video' then
    raise exception 'Progress for this lesson type is recorded differently.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_intervals) is distinct from 'array' or jsonb_array_length(p_intervals) > 50 then
    raise exception 'Invalid progress payload.' using errcode = '22023';
  end if;

  -- Lesson length: instructor-set duration is authoritative; the player's
  -- reported duration can only lower the completion bar by up to 20%.
  v_len := case
    when v_lesson.duration_sec > 0 then v_lesson.duration_sec
    else least(greatest(coalesce(p_player_duration, 0), 0), 43200)
  end;
  if v_len <= 0 then
    raise exception 'Lesson length unknown.' using errcode = '22023';
  end if;

  for v_item in select * from jsonb_array_elements(p_intervals) loop
    if jsonb_typeof(v_item) <> 'array' or jsonb_array_length(v_item) <> 2
       or jsonb_typeof(v_item -> 0) <> 'number' or jsonb_typeof(v_item -> 1) <> 'number' then
      raise exception 'Invalid progress payload.' using errcode = '22023';
    end if;
    v_s := greatest((v_item ->> 0)::numeric, 0);
    v_f := least((v_item ->> 1)::numeric, v_len);
    if v_f > v_s then
      v_clean := v_clean || jsonb_build_array(jsonb_build_array(v_s, v_f));
    end if;
  end loop;

  insert into public.lesson_progress (user_id, lesson_id, course_id, enrollment_id)
  values (v_uid, p_lesson_id, g.o_course_id, g.o_enrollment_id)
  on conflict (user_id, lesson_id) do nothing;

  select * into v_row from public.lesson_progress
  where user_id = v_uid and lesson_id = p_lesson_id
  for update;

  v_old := private.interval_total(v_row.watched_intervals);
  v_merged := private.merge_intervals(v_row.watched_intervals || v_clean);
  v_new := private.interval_total(v_merged);

  v_allowed := extract(epoch from (now() - coalesce(v_row.last_reported_at, v_row.created_at))) * 2.0 + 30;
  if v_new - v_old > v_allowed then
    v_accepted := false;
    v_merged := v_row.watched_intervals;
    v_new := v_old;
  end if;

  v_threshold := 0.85 * case
    when v_lesson.duration_sec > 0 and p_player_duration is not null
      then least(v_lesson.duration_sec, greatest(p_player_duration, 0.8 * v_lesson.duration_sec))
    else v_len
  end;
  v_completed := v_row.is_completed or v_new >= v_threshold;

  update public.lesson_progress
  set watched_intervals = v_merged,
      watched_sec       = floor(v_new)::int,
      last_position_sec = round(least(greatest(coalesce(p_position, 0), 0), v_len), 1),
      last_reported_at  = now(),
      is_completed      = v_completed,
      completed_at      = case when v_completed then coalesce(completed_at, now()) end,
      rejected_reports  = rejected_reports + case when v_accepted then 0 else 1 end
  where id = v_row.id;

  update public.enrollments
  set last_lesson_id = p_lesson_id, last_activity_at = now()
  where id = g.o_enrollment_id;

  if v_completed and not v_row.is_completed then
    perform private.refresh_enrollment_completion(g.o_enrollment_id);
  end if;

  return jsonb_build_object(
    'accepted', v_accepted,
    'watched_sec', floor(v_new)::int,
    'required_sec', ceil(v_threshold)::int,
    'is_completed', v_completed,
    'just_completed', v_completed and not v_row.is_completed
  );
end $$;

-- Article lessons: completed when the learner confirms they've read it.
create or replace function public.complete_article_lesson(p_lesson_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  g record;
  v_uid uuid := auth.uid();
  v_type public.lesson_type;
  v_was boolean;
begin
  select * into g from private.require_lesson_enrollment(p_lesson_id);

  select type into v_type from public.lessons where id = p_lesson_id;
  if v_type <> 'article' then
    raise exception 'Only reading lessons can be marked as read.' using errcode = '22023';
  end if;

  select is_completed into v_was from public.lesson_progress
  where user_id = v_uid and lesson_id = p_lesson_id;

  insert into public.lesson_progress as lp
    (user_id, lesson_id, course_id, enrollment_id, is_completed, completed_at, last_reported_at)
  values (v_uid, p_lesson_id, g.o_course_id, g.o_enrollment_id, true, now(), now())
  on conflict (user_id, lesson_id) do update
    set is_completed = true,
        completed_at = coalesce(lp.completed_at, now()),
        last_reported_at = now();

  update public.enrollments
  set last_lesson_id = p_lesson_id, last_activity_at = now()
  where id = g.o_enrollment_id;

  perform private.refresh_enrollment_completion(g.o_enrollment_id);

  return jsonb_build_object('is_completed', true, 'just_completed', not coalesce(v_was, false));
end $$;

revoke execute on function
  public.enroll_in_course(uuid),
  public.open_lesson(uuid),
  public.record_video_progress(uuid, jsonb, numeric, numeric),
  public.complete_article_lesson(uuid)
  from public, anon;
grant execute on function
  public.enroll_in_course(uuid),
  public.open_lesson(uuid),
  public.record_video_progress(uuid, jsonb, numeric, numeric),
  public.complete_article_lesson(uuid)
  to authenticated;
