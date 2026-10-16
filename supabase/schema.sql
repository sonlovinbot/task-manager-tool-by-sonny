-- Bản nháp lược đồ cho phiên bản đồng bộ Supabase. Chạy trong Supabase > SQL Editor.
-- Khớp với kiểu Task của ứng dụng (src/domain/task.ts). Mỗi dòng thuộc về một người dùng (auth.uid()).

create table if not exists public.tasks (
  id            uuid primary key,
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title         text not null check (length(btrim(title)) > 0),
  description   text not null default '',
  status        text not null default 'todo'   check (status   in ('todo', 'doing', 'done')),
  priority      text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  due_date      date,
  label         text,
  subtasks      jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null,
  updated_at    timestamptz not null,
  completed_at  timestamptz,
  deleted_at    timestamptz
);

create index if not exists tasks_user_updated_idx on public.tasks (user_id, updated_at desc);

alter table public.tasks enable row level security;

-- Mỗi người chỉ đọc và ghi dòng của chính mình.
create policy "tasks_select_own" on public.tasks for select to authenticated using (user_id = auth.uid());
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks for delete to authenticated using (user_id = auth.uid());
