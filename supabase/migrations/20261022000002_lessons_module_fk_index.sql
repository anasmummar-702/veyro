-- Covering index for the composite (module_id, course_id) foreign key on lessons.
create index if not exists lessons_module_course_idx on public.lessons (module_id, course_id);
