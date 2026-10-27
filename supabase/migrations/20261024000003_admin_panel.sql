-- Veyro: admin panel.
--   * Admins can create, edit and delete courses, modules, sections (lessons)
--     and their content directly; RLS policies limit every write to admins.
--   * Reordering goes through RPCs so position swaps happen in one transaction.
--   * lessons.has_video stays in sync with lesson_contents automatically.
--   * admin_overview() and admin_students() give admins learner statistics,
--     including emails, which no other role can read.

-- ---------------------------------------------------------------- write access for admins
grant insert, update, delete on public.courses, public.modules, public.lessons, public.lesson_contents to authenticated;
grant insert, update on public.categories to authenticated;

create policy "courses: admins write" on public.courses
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "modules: admins write" on public.modules
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "lessons: admins write" on public.lessons
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "lesson contents: admins write" on public.lesson_contents
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "categories: admins write" on public.categories
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- New courses are owned by the Veyro editorial account (so cards say "Veyro"),
-- falling back to the admin who created them.
create or replace function private.default_course_instructor()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.instructor_id is null then
    select p.id into new.instructor_id
    from public.profiles p join auth.users u on u.id = p.id
    where u.email = 'editorial@veyro.local';
    new.instructor_id := coalesce(new.instructor_id, auth.uid());
  end if;
  return new;
end $$;

drop trigger if exists courses_default_instructor on public.courses;
create trigger courses_default_instructor before insert on public.courses
  for each row execute function private.default_course_instructor();

-- Keep lessons.has_video in step with the lesson's content row.
create or replace function private.sync_lesson_has_video()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    update public.lessons set has_video = false where id = old.lesson_id;
    return old;
  end if;
  update public.lessons set has_video = (new.video_ref is not null)
  where id = new.lesson_id and has_video is distinct from (new.video_ref is not null);
  return new;
end $$;

drop trigger if exists lesson_contents_has_video on public.lesson_contents;
create trigger lesson_contents_has_video after insert or update of video_ref or delete on public.lesson_contents
  for each row execute function private.sync_lesson_has_video();

revoke execute on function private.default_course_instructor(), private.sync_lesson_has_video()
  from public, anon, authenticated;

-- ---------------------------------------------------------------- reordering
create or replace function private.require_admin()
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.is_admin() then
    raise exception 'Admins only.' using errcode = '42501';
  end if;
end $$;
revoke execute on function private.require_admin() from public, anon, authenticated;

-- Move a module one place up (-1) or down (+1) within its course.
create or replace function public.admin_move_module(p_module_id uuid, p_direction int)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_me public.modules;
  v_other public.modules;
begin
  perform private.require_admin();
  select * into v_me from public.modules where id = p_module_id;
  if v_me.id is null then raise exception 'Module not found.' using errcode = 'P0002'; end if;
  select * into v_other from public.modules
  where course_id = v_me.course_id
    and case when p_direction < 0 then position < v_me.position else position > v_me.position end
  order by case when p_direction < 0 then -position else position end
  limit 1;
  if v_other.id is null then return; end if;
  set constraints public.modules_course_position_key deferred;
  update public.modules set position = v_other.position where id = v_me.id;
  update public.modules set position = v_me.position where id = v_other.id;
end $$;

-- Move a section one place up (-1) or down (+1) within its module.
create or replace function public.admin_move_lesson(p_lesson_id uuid, p_direction int)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_me public.lessons;
  v_other public.lessons;
begin
  perform private.require_admin();
  select * into v_me from public.lessons where id = p_lesson_id;
  if v_me.id is null then raise exception 'Section not found.' using errcode = 'P0002'; end if;
  select * into v_other from public.lessons
  where module_id = v_me.module_id
    and case when p_direction < 0 then position < v_me.position else position > v_me.position end
  order by case when p_direction < 0 then -position else position end
  limit 1;
  if v_other.id is null then return; end if;
  set constraints public.lessons_module_position_key deferred;
  update public.lessons set position = v_other.position where id = v_me.id;
  update public.lessons set position = v_me.position where id = v_other.id;
end $$;

revoke execute on function public.admin_move_module(uuid, int), public.admin_move_lesson(uuid, int) from public, anon;
grant execute on function public.admin_move_module(uuid, int), public.admin_move_lesson(uuid, int) to authenticated;

-- ---------------------------------------------------------------- statistics
create or replace function public.admin_overview()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v jsonb;
begin
  perform private.require_admin();
  select jsonb_build_object(
    'students',          (select count(*) from public.profiles where role = 'student'),
    'new_students_7d',   (select count(*) from public.profiles where role = 'student' and created_at > now() - interval '7 days'),
    'active_learners_7d',(select count(distinct user_id) from public.enrollments where last_activity_at > now() - interval '7 days'),
    'enrollments',       (select count(*) from public.enrollments where status in ('active', 'completed')),
    'in_progress',       (select count(*) from public.enrollments where status = 'active'),
    'completed',         (select count(*) from public.enrollments where status = 'completed'),
    'certificates',      (select count(*) from public.certificates),
    'lessons_completed', (select count(*) from public.lesson_progress where is_completed),
    'courses', coalesce((
      select jsonb_agg(row_to_json(t) order by t.published_at desc nulls last, t.title)
      from (
        select c.id, c.slug, c.title, c.status, c.published_at,
          (select count(*) from public.modules m where m.course_id = c.id) as modules,
          (select count(*) from public.lessons l where l.course_id = c.id) as sections,
          (select count(*) from public.lessons l where l.course_id = c.id and l.has_video) as videos,
          (select count(*) from public.enrollments e where e.course_id = c.id and e.status in ('active', 'completed')) as enrolled,
          (select count(*) from public.enrollments e where e.course_id = c.id and e.status = 'completed') as completed,
          coalesce((
            select round(avg(p.pct))
            from (
              select e.id, 100.0 * count(lp.id) filter (where lp.is_completed and l.is_required)
                       / nullif((select count(*) from public.lessons r where r.course_id = c.id and r.is_required), 0) as pct
              from public.enrollments e
              left join public.lesson_progress lp on lp.enrollment_id = e.id
              left join public.lessons l on l.id = lp.lesson_id
              where e.course_id = c.id and e.status in ('active', 'completed')
              group by e.id
            ) p
          ), 0) as avg_progress
        from public.courses c
      ) t
    ), '[]'::jsonb)
  ) into v;
  return v;
end $$;

create or replace function public.admin_students()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.app_role,
  status text,
  joined_at timestamptz,
  last_sign_in_at timestamptz,
  last_activity_at timestamptz,
  certificates int,
  courses jsonb
)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.require_admin();
  return query
  select p.id, p.full_name, u.email::text, p.role, p.status, p.created_at, u.last_sign_in_at,
    (select max(e.last_activity_at) from public.enrollments e where e.user_id = p.id),
    (select count(*)::int from public.certificates ce where ce.user_id = p.id),
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'title', c.title,
        'slug', c.slug,
        'status', e.status,
        'enrolled_at', e.enrolled_at,
        'completed_at', e.completed_at,
        'last_activity_at', e.last_activity_at,
        'done', (select count(*) from public.lesson_progress lp join public.lessons l on l.id = lp.lesson_id
                 where lp.enrollment_id = e.id and lp.is_completed and l.is_required),
        'total', (select count(*) from public.lessons l where l.course_id = c.id and l.is_required)
      ) order by e.last_activity_at desc)
      from public.enrollments e join public.courses c on c.id = e.course_id
      where e.user_id = p.id and e.status in ('active', 'completed')
    ), '[]'::jsonb)
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email is distinct from 'editorial@veyro.local'
  order by p.created_at desc;
end $$;

revoke execute on function public.admin_overview(), public.admin_students() from public, anon;
grant execute on function public.admin_overview(), public.admin_students() to authenticated;
