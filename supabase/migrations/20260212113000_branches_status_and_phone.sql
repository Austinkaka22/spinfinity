alter table public.branches
  add column if not exists status text not null default 'active',
  add column if not exists phone_number text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'branches_status_check'
  ) then
    alter table public.branches
      add constraint branches_status_check
      check (status in ('active', 'inactive', 'closed'));
  end if;
end $$;

update public.branches
set status = case
  when is_active = true then 'active'
  else 'inactive'
end;
