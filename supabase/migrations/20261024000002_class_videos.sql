-- Veyro: a video in any class.
--   * Admins (or the course's instructor) attach a YouTube video to a class
--     through set_lesson_video(); the video plays above the class notes.
--   * lessons.has_video is public outline metadata (so the course page can
--     show which classes have video); the video id itself stays in
--     lesson_contents, readable only by enrolled learners, previews and owners.

alter table public.lessons add column if not exists has_video boolean not null default false;

update public.lessons l
set has_video = true
where exists (select 1 from public.lesson_contents c where c.lesson_id = l.id and c.video_ref is not null);

create or replace function public.set_lesson_video(p_lesson_id uuid, p_video_ref text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_course uuid;
  v_ref text := nullif(btrim(coalesce(p_video_ref, '')), '');
begin
  if auth.uid() is null then
    raise exception 'Sign in to manage videos.' using errcode = '28000';
  end if;

  select course_id into v_course from public.lessons where id = p_lesson_id;
  if v_course is null then
    raise exception 'That class no longer exists.' using errcode = 'P0002';
  end if;
  if not private.can_manage_course(v_course) then
    raise exception 'Only admins can change class videos.' using errcode = '42501';
  end if;
  if v_ref is not null and v_ref !~ '^[A-Za-z0-9_-]{11}$' then
    raise exception 'That doesn''t look like a YouTube video link.' using errcode = '22023';
  end if;

  insert into public.lesson_contents as lc (lesson_id, video_provider, video_ref, attribution)
  values (p_lesson_id, case when v_ref is null then null else 'youtube' end, v_ref, null)
  on conflict (lesson_id) do update
    set video_provider = excluded.video_provider,
        video_ref = excluded.video_ref,
        attribution = null;

  update public.lessons set has_video = (v_ref is not null) where id = p_lesson_id;
end $$;

revoke execute on function public.set_lesson_video(uuid, text) from public, anon;
grant execute on function public.set_lesson_video(uuid, text) to authenticated;
