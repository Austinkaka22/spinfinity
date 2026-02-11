-- Spinfinity Milestone 1 + 2
-- Auth/RBAC foundation + Master Data schema + seed data.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  branch_type text not null check (branch_type in ('hub', 'satellite')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin', 'staff', 'driver')),
  branch_id uuid references public.branches(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_rates (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  pricing_category_id uuid references public.pricing_categories(id) on delete set null,
  pricing_model text not null check (pricing_model in ('itemized', 'weighted')),
  unit_price numeric(12,2),
  price_per_kg numeric(12,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_rates_value_check check (
    (pricing_model = 'itemized' and unit_price is not null and price_per_kg is null)
    or
    (pricing_model = 'weighted' and price_per_kg is not null and unit_price is null)
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'pricing_rates_unique'
  ) then
    alter table public.pricing_rates
      add constraint pricing_rates_unique
      unique nulls not distinct (item_id, pricing_category_id, pricing_model);
  end if;
end $$;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_branch_idx on public.profiles(branch_id);
create index if not exists pricing_rates_item_idx on public.pricing_rates(item_id);
create index if not exists pricing_rates_category_idx on public.pricing_rates(pricing_category_id);

drop trigger if exists trg_branches_updated_at on public.branches;
create trigger trg_branches_updated_at
before update on public.branches
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_items_updated_at on public.items;
create trigger trg_items_updated_at
before update on public.items
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_pricing_categories_updated_at on public.pricing_categories;
create trigger trg_pricing_categories_updated_at
before update on public.pricing_categories
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_pricing_rates_updated_at on public.pricing_rates;
create trigger trg_pricing_rates_updated_at
before update on public.pricing_rates
for each row execute procedure public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

grant execute on function public.is_admin() to authenticated;

alter table public.branches enable row level security;
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.pricing_categories enable row level security;
alter table public.pricing_rates enable row level security;

drop policy if exists branches_read_authenticated on public.branches;
create policy branches_read_authenticated
on public.branches
for select
to authenticated
using (true);

drop policy if exists branches_write_admin on public.branches;
create policy branches_write_admin
on public.branches
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_write_admin on public.profiles;
create policy profiles_write_admin
on public.profiles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists items_read_authenticated on public.items;
create policy items_read_authenticated
on public.items
for select
to authenticated
using (true);

drop policy if exists items_write_admin on public.items;
create policy items_write_admin
on public.items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists pricing_categories_read_authenticated on public.pricing_categories;
create policy pricing_categories_read_authenticated
on public.pricing_categories
for select
to authenticated
using (true);

drop policy if exists pricing_categories_write_admin on public.pricing_categories;
create policy pricing_categories_write_admin
on public.pricing_categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists pricing_rates_read_authenticated on public.pricing_rates;
create policy pricing_rates_read_authenticated
on public.pricing_rates
for select
to authenticated
using (true);

drop policy if exists pricing_rates_write_admin on public.pricing_rates;
create policy pricing_rates_write_admin
on public.pricing_rates
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.branches (code, name, branch_type, is_active)
values
  ('BUR', 'Buruburu Arcade', 'hub', true),
  ('EPR', 'Epren Center', 'satellite', true)
on conflict (code) do update
set
  name = excluded.name,
  branch_type = excluded.branch_type,
  is_active = excluded.is_active;

insert into public.items (name, description, is_active)
values
  ('Suit', 'Two-piece suit dry clean', true),
  ('Shirt', 'Standard shirt press and clean', true),
  ('Dress', 'Dress dry clean service', true),
  ('Bedding', 'General bedding by weight', true),
  ('Laundry Bag', 'Retail laundry bag', true)
on conflict (name) do update
set
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.pricing_categories (name, description, is_active)
values
  ('Standard', 'Default customer pricing', true),
  ('Express', 'Priority turnaround pricing', true),
  ('Corporate', 'Contract/business pricing', true)
on conflict (name) do update
set
  description = excluded.description,
  is_active = excluded.is_active;

insert into public.pricing_rates (
  item_id,
  pricing_category_id,
  pricing_model,
  unit_price,
  price_per_kg,
  is_active
)
select
  i.id,
  c.id,
  'itemized',
  500.00,
  null,
  true
from public.items i
join public.pricing_categories c on c.name = 'Standard'
where i.name = 'Suit'
on conflict on constraint pricing_rates_unique do nothing;

insert into public.pricing_rates (
  item_id,
  pricing_category_id,
  pricing_model,
  unit_price,
  price_per_kg,
  is_active
)
select
  i.id,
  c.id,
  'itemized',
  200.00,
  null,
  true
from public.items i
join public.pricing_categories c on c.name = 'Standard'
where i.name = 'Shirt'
on conflict on constraint pricing_rates_unique do nothing;

insert into public.pricing_rates (
  item_id,
  pricing_category_id,
  pricing_model,
  unit_price,
  price_per_kg,
  is_active
)
select
  i.id,
  c.id,
  'weighted',
  null,
  150.00,
  true
from public.items i
join public.pricing_categories c on c.name = 'Standard'
where i.name = 'Bedding'
on conflict on constraint pricing_rates_unique do nothing;

-- Optional profile seeds if these users already exist in auth.users.
insert into public.profiles (id, full_name, role, branch_id, is_active)
select
  u.id,
  'System Admin',
  'admin',
  null,
  true
from auth.users u
where u.email = 'admin@spinfinity.local'
on conflict (id) do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  branch_id = excluded.branch_id,
  is_active = excluded.is_active;

insert into public.profiles (id, full_name, role, branch_id, is_active)
select
  u.id,
  'Buruburu Staff',
  'staff',
  b.id,
  true
from auth.users u
cross join public.branches b
where u.email = 'staff.bur@spinfinity.local'
  and b.code = 'BUR'
on conflict (id) do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  branch_id = excluded.branch_id,
  is_active = excluded.is_active;

insert into public.profiles (id, full_name, role, branch_id, is_active)
select
  u.id,
  'Delivery Driver',
  'driver',
  null,
  true
from auth.users u
where u.email = 'driver@spinfinity.local'
on conflict (id) do update
set
  full_name = excluded.full_name,
  role = excluded.role,
  branch_id = excluded.branch_id,
  is_active = excluded.is_active;
