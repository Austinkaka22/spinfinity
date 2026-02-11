-- Spinfinity Milestone 3
-- 1) Auto-create profile row when auth user is created.
-- 2) Hybrid invoice schema and numbering.

create extension if not exists pgcrypto;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, branch_id, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case
      when coalesce(new.raw_user_meta_data ->> 'role', '') in ('admin','staff','driver')
        then new.raw_user_meta_data ->> 'role'
      else 'staff'
    end,
    nullif(new.raw_user_meta_data ->> 'branch_id', '')::uuid,
    true
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role,
    branch_id = excluded.branch_id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Backfill missing profiles for existing auth users.
insert into public.profiles (id, full_name, role, branch_id, is_active)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  case
    when coalesce(u.raw_user_meta_data ->> 'role', '') in ('admin','staff','driver')
      then u.raw_user_meta_data ->> 'role'
    else 'staff'
  end,
  nullif(u.raw_user_meta_data ->> 'branch_id', '')::uuid,
  true
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  branch_id uuid not null references public.branches(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  notes text,
  subtotal numeric(12,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  status text not null default 'received'
    check (status in ('received','in_transit','processing','washed','ready','dispatched','completed','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  line_type text not null check (line_type in ('itemized','weighted')),
  item_id uuid not null references public.items(id) on delete restrict,
  pricing_rate_id uuid not null references public.pricing_rates(id) on delete restrict,
  description text,
  quantity numeric(12,3),
  weight_kg numeric(12,3),
  unit_price numeric(12,2),
  price_per_kg numeric(12,2),
  line_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint order_lines_values_check check (
    (line_type = 'itemized' and quantity is not null and quantity > 0 and unit_price is not null and weight_kg is null and price_per_kg is null)
    or
    (line_type = 'weighted' and weight_kg is not null and weight_kg > 0 and price_per_kg is not null and quantity is null and unit_price is null)
  )
);

create index if not exists orders_branch_idx on public.orders(branch_id);
create index if not exists orders_created_by_idx on public.orders(created_by);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_lines_order_id_idx on public.order_lines(order_id);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_order_lines_updated_at on public.order_lines;
create trigger trg_order_lines_updated_at
before update on public.order_lines
for each row execute procedure public.set_updated_at();

create sequence if not exists public.invoice_number_seq;

create or replace function public.generate_invoice_number()
returns text
language plpgsql
as $$
declare
  seq_value bigint;
begin
  seq_value := nextval('public.invoice_number_seq');
  return 'INV-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(seq_value::text, 6, '0');
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

create or replace function public.current_user_branch_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.branch_id
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true
  limit 1;
$$;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_branch_id() to authenticated;
grant execute on function public.generate_invoice_number() to authenticated;

alter table public.orders enable row level security;
alter table public.order_lines enable row level security;

drop policy if exists orders_read_role_scope on public.orders;
create policy orders_read_role_scope
on public.orders
for select
to authenticated
using (
  public.current_user_role() = 'admin'
  or
  (public.current_user_role() = 'staff' and branch_id = public.current_user_branch_id())
  or
  (public.current_user_role() = 'driver')
);

drop policy if exists orders_write_staff_admin on public.orders;
create policy orders_write_staff_admin
on public.orders
for all
to authenticated
using (
  public.current_user_role() in ('admin', 'staff')
  and (
    public.current_user_role() = 'admin'
    or branch_id = public.current_user_branch_id()
  )
)
with check (
  public.current_user_role() in ('admin', 'staff')
  and (
    public.current_user_role() = 'admin'
    or branch_id = public.current_user_branch_id()
  )
);

drop policy if exists order_lines_read_role_scope on public.order_lines;
create policy order_lines_read_role_scope
on public.order_lines
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_lines.order_id
      and (
        public.current_user_role() = 'admin'
        or (public.current_user_role() = 'staff' and o.branch_id = public.current_user_branch_id())
        or public.current_user_role() = 'driver'
      )
  )
);

drop policy if exists order_lines_write_staff_admin on public.order_lines;
create policy order_lines_write_staff_admin
on public.order_lines
for all
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_lines.order_id
      and (
        public.current_user_role() = 'admin'
        or (public.current_user_role() = 'staff' and o.branch_id = public.current_user_branch_id())
      )
  )
)
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_lines.order_id
      and (
        public.current_user_role() = 'admin'
        or (public.current_user_role() = 'staff' and o.branch_id = public.current_user_branch_id())
      )
  )
);
