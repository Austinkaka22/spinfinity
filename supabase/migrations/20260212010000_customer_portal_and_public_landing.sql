-- Customer experience foundation:
-- - customer role support
-- - profile contact fields
-- - order ownership by customer account
-- - public pickup requests
-- - public pricing visibility

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'staff', 'driver', 'customer'));

alter table public.profiles
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists address text;

create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email))
  where email is not null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, branch_id, is_active, email, phone, address)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    case
      when coalesce(new.raw_user_meta_data ->> 'role', '') in ('admin','staff','driver','customer')
        then new.raw_user_meta_data ->> 'role'
      else 'customer'
    end,
    nullif(new.raw_user_meta_data ->> 'branch_id', '')::uuid,
    true,
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'address', '')
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role,
    branch_id = excluded.branch_id,
    email = excluded.email,
    phone = excluded.phone,
    address = excluded.address;

  return new;
end;
$$;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is distinct from u.email);

alter table public.orders
  add column if not exists customer_id uuid references auth.users(id) on delete set null;

create index if not exists orders_customer_id_idx on public.orders(customer_id);

drop policy if exists orders_read_role_scope on public.orders;
create policy orders_read_role_scope
on public.orders
for select
to authenticated
using (
  public.current_user_role() = 'admin'
  or (public.current_user_role() = 'staff' and branch_id = public.current_user_branch_id())
  or public.current_user_role() = 'driver'
  or (public.current_user_role() = 'customer' and customer_id = auth.uid())
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
        or (public.current_user_role() = 'customer' and o.customer_id = auth.uid())
      )
  )
);

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

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists items_read_authenticated on public.items;
create policy items_read_authenticated
on public.items
for select
to authenticated
using (true);

drop policy if exists items_read_public on public.items;
create policy items_read_public
on public.items
for select
to anon
using (is_active = true);

drop policy if exists pricing_categories_read_authenticated on public.pricing_categories;
create policy pricing_categories_read_authenticated
on public.pricing_categories
for select
to authenticated
using (true);

drop policy if exists pricing_categories_read_public on public.pricing_categories;
create policy pricing_categories_read_public
on public.pricing_categories
for select
to anon
using (is_active = true);

drop policy if exists pricing_rates_read_authenticated on public.pricing_rates;
create policy pricing_rates_read_authenticated
on public.pricing_rates
for select
to authenticated
using (true);

drop policy if exists pricing_rates_read_public on public.pricing_rates;
create policy pricing_rates_read_public
on public.pricing_rates
for select
to anon
using (is_active = true);

create table if not exists public.pickup_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  pickup_address text not null,
  preferred_date date,
  preferred_time time,
  notes text,
  status text not null default 'pending'
    check (status in ('pending','scheduled','picked_up','cancelled','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_pickup_requests_updated_at on public.pickup_requests;
create trigger trg_pickup_requests_updated_at
before update on public.pickup_requests
for each row execute procedure public.set_updated_at();

alter table public.pickup_requests enable row level security;

drop policy if exists pickup_requests_insert_public on public.pickup_requests;
create policy pickup_requests_insert_public
on public.pickup_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists pickup_requests_read_internal on public.pickup_requests;
create policy pickup_requests_read_internal
on public.pickup_requests
for select
to authenticated
using (public.current_user_role() in ('admin', 'staff', 'driver'));

drop policy if exists pickup_requests_update_internal on public.pickup_requests;
create policy pickup_requests_update_internal
on public.pickup_requests
for update
to authenticated
using (public.current_user_role() in ('admin', 'staff'))
with check (public.current_user_role() in ('admin', 'staff'));
