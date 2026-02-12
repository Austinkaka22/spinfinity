alter table public.items
  add column if not exists status text not null default 'active';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'items_status_check'
  ) then
    alter table public.items
      add constraint items_status_check
      check (status in ('active', 'inactive'));
  end if;
end $$;

update public.items
set status = case
  when is_active = true then 'active'
  else 'inactive'
end;

create table if not exists public.weight_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  min_kg numeric(12,3) not null check (min_kg > 0),
  max_kg numeric(12,3) not null check (max_kg > min_kg),
  price_per_kg numeric(12,2) not null check (price_per_kg >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists weight_pricing_tiers_min_kg_idx
  on public.weight_pricing_tiers (min_kg);

drop trigger if exists trg_weight_pricing_tiers_updated_at on public.weight_pricing_tiers;
create trigger trg_weight_pricing_tiers_updated_at
before update on public.weight_pricing_tiers
for each row execute procedure public.set_updated_at();

alter table public.weight_pricing_tiers enable row level security;

drop policy if exists weight_pricing_tiers_read_authenticated on public.weight_pricing_tiers;
create policy weight_pricing_tiers_read_authenticated
on public.weight_pricing_tiers
for select
to authenticated
using (true);

drop policy if exists weight_pricing_tiers_write_admin on public.weight_pricing_tiers;
create policy weight_pricing_tiers_write_admin
on public.weight_pricing_tiers
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.weight_pricing_tiers (min_kg, max_kg, price_per_kg, is_active)
values
  (0.001, 5.000, 150.00, true),
  (5.001, 10.000, 145.00, true),
  (10.001, 25.000, 140.00, true)
on conflict do nothing;
