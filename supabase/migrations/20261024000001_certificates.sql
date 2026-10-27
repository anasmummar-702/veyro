-- Veyro: certificates of completion.
--   * A certificate is issued automatically, exactly once, when an enrollment
--     becomes 'completed' (every required lesson done).
--   * Learners can read their own certificates; anyone can verify a
--     certificate by its serial through verify_certificate(), which exposes
--     only what is printed on the certificate.
--   * Name and course title are snapshotted at issue time so the certificate
--     stays stable even if they change later.

create table public.certificates (
  id              uuid primary key default gen_random_uuid(),
  serial          text not null unique check (serial ~ '^VEY-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  course_id       uuid not null references public.courses (id) on delete cascade,
  enrollment_id   uuid not null references public.enrollments (id) on delete cascade,
  recipient_name  text not null check (char_length(recipient_name) between 1 and 120),
  course_title    text not null,
  issued_at       timestamptz not null default now(),
  unique (user_id, course_id)
);

create index certificates_user_idx       on public.certificates (user_id, issued_at desc);
create index certificates_course_idx     on public.certificates (course_id);
create index certificates_enrollment_idx on public.certificates (enrollment_id);

alter table public.certificates enable row level security;
revoke all on public.certificates from anon, authenticated;
grant select on public.certificates to authenticated;

create policy "certificates: own or course owner" on public.certificates
  for select to authenticated using (
    user_id = (select auth.uid()) or private.can_manage_course(course_id)
  );

-- ---------------------------------------------------------------- issuing

create or replace function private.new_certificate_serial()
returns text language sql volatile set search_path = '' as $$
  -- 12 random characters from an unambiguous alphabet (no 0/O, 1/I/L).
  select 'VEY-' || string_agg(substr(chars, 1 + floor(random() * length(chars))::int, 1)
                              || case when i in (4, 8) then '-' else '' end, '' order by i)
  from (select '23456789ABCDEFGHJKMNPQRSTUVWXYZ' as chars) c, generate_series(1, 12) as i;
$$;

-- Idempotent: returns the existing certificate or issues one for a completed enrollment.
create or replace function private.issue_certificate(p_enrollment_id uuid)
returns public.certificates
language plpgsql security definer set search_path = '' as $$
declare
  v_enr public.enrollments;
  v_cert public.certificates;
  v_name text;
  v_title text;
  v_try int := 0;
begin
  select * into v_enr from public.enrollments where id = p_enrollment_id;
  if v_enr.id is null or v_enr.status <> 'completed' then
    return null;
  end if;

  select * into v_cert from public.certificates
  where user_id = v_enr.user_id and course_id = v_enr.course_id;
  if v_cert.id is not null then
    return v_cert;
  end if;

  select coalesce(nullif(btrim(p.full_name), ''), nullif(split_part(u.email, '@', 1), ''), 'Veyro learner')
  into v_name
  from public.profiles p
  left join auth.users u on u.id = p.id
  where p.id = v_enr.user_id;

  select title into v_title from public.courses where id = v_enr.course_id;

  loop
    begin
      insert into public.certificates
        (serial, user_id, course_id, enrollment_id, recipient_name, course_title, issued_at)
      values
        (private.new_certificate_serial(), v_enr.user_id, v_enr.course_id, v_enr.id,
         left(v_name, 120), v_title, coalesce(v_enr.completed_at, now()))
      on conflict (user_id, course_id) do nothing
      returning * into v_cert;
      exit;
    exception when unique_violation then
      -- serial collision (astronomically unlikely); retry with a new serial
      v_try := v_try + 1;
      if v_try > 5 then raise; end if;
    end;
  end loop;

  if v_cert.id is null then
    select * into v_cert from public.certificates
    where user_id = v_enr.user_id and course_id = v_enr.course_id;
  end if;
  return v_cert;
end $$;

-- Course completion now also issues the certificate.
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

    perform private.issue_certificate(p_enrollment_id);
  end if;
end $$;

revoke execute on function
  private.new_certificate_serial(), private.issue_certificate(uuid), private.refresh_enrollment_completion(uuid)
  from public, anon, authenticated;

-- Learner-facing: make sure every completed course of mine has its certificate
-- (covers courses completed before certificates existed). Returns my certificates.
create or replace function public.claim_my_certificates()
returns setof public.certificates
language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_enr uuid;
begin
  if v_uid is null then
    raise exception 'Sign in to view your certificates.' using errcode = '28000';
  end if;
  for v_enr in
    select e.id from public.enrollments e
    where e.user_id = v_uid and e.status = 'completed'
      and not exists (select 1 from public.certificates c where c.user_id = v_uid and c.course_id = e.course_id)
  loop
    perform private.issue_certificate(v_enr);
  end loop;
  return query
    select * from public.certificates where user_id = v_uid order by issued_at desc;
end $$;

-- Public verification by serial: only what's printed on the certificate.
create or replace function public.verify_certificate(p_serial text)
returns table (serial text, recipient_name text, course_title text, course_slug text, issued_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.serial, c.recipient_name, c.course_title, co.slug, c.issued_at
  from public.certificates c
  join public.courses co on co.id = c.course_id
  where c.serial = upper(btrim(p_serial));
$$;

revoke execute on function public.claim_my_certificates(), public.verify_certificate(text) from public;
-- Supabase grants EXECUTE on new public functions to anon by default; claiming is for signed-in learners only.
revoke execute on function public.claim_my_certificates() from anon;
grant execute on function public.claim_my_certificates() to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
