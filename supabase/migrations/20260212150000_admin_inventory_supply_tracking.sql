-- Admin supply tracking for branch consumables and storage-managed restocking.

create table if not exists public.branch_supply_levels (
  branch_id uuid not null references public.branches(id) on delete cascade,
  supply_item text not null check (supply_item in ('dirtex', 'perchlo', 'laundry_bag')),
  quantity numeric(12,2) not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (branch_id, supply_item)
);

create table if not exists public.storage_supply_levels (
  supply_item text primary key check (supply_item in ('laundry_bag', 'hanger')),
  quantity integer not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branch_restock_logs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete restrict,
  supply_item text not null check (supply_item in ('dirtex', 'perchlo', 'laundry_bag', 'hanger')),
  quantity numeric(12,2) check (quantity is null or quantity > 0),
  source_type text not null check (source_type in ('direct', 'storage')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint branch_restock_logs_source_item_check check (
    (supply_item in ('dirtex', 'perchlo') and source_type = 'direct')
    or
    (supply_item = 'laundry_bag' and source_type = 'storage')
    or
    (supply_item = 'hanger' and source_type = 'storage')
  )
);

create index if not exists branch_restock_logs_created_at_idx
  on public.branch_restock_logs (created_at desc);

create index if not exists branch_restock_logs_branch_id_idx
  on public.branch_restock_logs (branch_id);

drop trigger if exists trg_branch_supply_levels_updated_at on public.branch_supply_levels;
create trigger trg_branch_supply_levels_updated_at
before update on public.branch_supply_levels
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_storage_supply_levels_updated_at on public.storage_supply_levels;
create trigger trg_storage_supply_levels_updated_at
before update on public.storage_supply_levels
for each row execute procedure public.set_updated_at();

alter table public.branch_supply_levels enable row level security;
alter table public.storage_supply_levels enable row level security;
alter table public.branch_restock_logs enable row level security;

drop policy if exists branch_supply_levels_read_authenticated on public.branch_supply_levels;
create policy branch_supply_levels_read_authenticated
on public.branch_supply_levels
for select
to authenticated
using (true);

drop policy if exists branch_supply_levels_write_admin on public.branch_supply_levels;
create policy branch_supply_levels_write_admin
on public.branch_supply_levels
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists storage_supply_levels_read_authenticated on public.storage_supply_levels;
create policy storage_supply_levels_read_authenticated
on public.storage_supply_levels
for select
to authenticated
using (true);

drop policy if exists storage_supply_levels_write_admin on public.storage_supply_levels;
create policy storage_supply_levels_write_admin
on public.storage_supply_levels
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists branch_restock_logs_read_authenticated on public.branch_restock_logs;
create policy branch_restock_logs_read_authenticated
on public.branch_restock_logs
for select
to authenticated
using (true);

drop policy if exists branch_restock_logs_write_admin on public.branch_restock_logs;
create policy branch_restock_logs_write_admin
on public.branch_restock_logs
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.storage_supply_levels (supply_item, quantity)
values
  ('laundry_bag', 0),
  ('hanger', 0)
on conflict (supply_item) do nothing;

insert into public.branch_supply_levels (branch_id, supply_item, quantity)
select
  b.id,
  s.supply_item,
  0
from public.branches b
cross join (
  values ('dirtex'::text), ('perchlo'::text), ('laundry_bag'::text)
) as s(supply_item)
on conflict (branch_id, supply_item) do nothing;

create or replace function public.admin_receive_storage_supply(
  p_item text,
  p_quantity integer,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can receive storage supply';
  end if;

  if p_item not in ('laundry_bag', 'hanger') then
    raise exception 'Only laundry_bag or hanger can be received to storage';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  if mod(p_quantity, 50) <> 0 then
    raise exception 'Laundry bag and hanger quantities must be in batches of 50';
  end if;

  insert into public.storage_supply_levels (supply_item, quantity)
  values (p_item, p_quantity)
  on conflict (supply_item) do update
  set quantity = storage_supply_levels.quantity + excluded.quantity;
end;
$$;

grant execute on function public.admin_receive_storage_supply(text, integer, text) to authenticated;

create or replace function public.admin_restock_branch_supply(
  p_branch_id uuid,
  p_item text,
  p_quantity numeric,
  p_source text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_storage_qty integer;
  target_branch_type text;
begin
  if not public.is_admin() then
    raise exception 'Only admins can restock supplies';
  end if;

  if p_branch_id is null then
    raise exception 'Branch is required';
  end if;

  if p_source not in ('direct', 'storage') then
    raise exception 'Invalid source';
  end if;

  select b.branch_type
  into target_branch_type
  from public.branches b
  where b.id = p_branch_id;

  if target_branch_type is null then
    raise exception 'Branch not found';
  end if;

  if p_item = 'hanger' then
    if p_source <> 'storage' then
      raise exception 'Hangers must come from storage';
    end if;

    if p_quantity is null or p_quantity <= 0 then
      raise exception 'Quantity must be greater than zero';
    end if;

    if mod(p_quantity::integer, 50) <> 0 or p_quantity <> trunc(p_quantity) then
      raise exception 'Laundry bag and hanger quantities must be in batches of 50';
    end if;

    select quantity
    into current_storage_qty
    from public.storage_supply_levels
    where supply_item = 'hanger'
    for update;

    if current_storage_qty is null then
      raise exception 'Storage stock for hanger is not initialized';
    end if;

    if current_storage_qty < p_quantity then
      raise exception 'Insufficient hanger stock in storage';
    end if;

    update public.storage_supply_levels
    set quantity = quantity - p_quantity::integer
    where supply_item = 'hanger';

    insert into public.branch_restock_logs (
      branch_id,
      supply_item,
      quantity,
      source_type,
      note,
      created_by
    )
    values (
      p_branch_id,
      p_item,
      p_quantity,
      p_source,
      coalesce(p_note, 'Hangers restocked (not tracked)'),
      auth.uid()
    );

    return;
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  if p_item not in ('dirtex', 'perchlo', 'laundry_bag') then
    raise exception 'Invalid supply item';
  end if;

  if p_item in ('dirtex', 'perchlo') and p_source <> 'direct' then
    raise exception 'Dirtex and Perchlo must be direct branch supplies';
  end if;

  if p_item = 'laundry_bag' and p_source <> 'storage' then
    raise exception 'Laundry Bags must come from storage';
  end if;

  if p_item in ('dirtex', 'perchlo') and target_branch_type <> 'hub' then
    raise exception 'Dirtex and Perchlo can only be restocked to hub branches';
  end if;

  if p_item = 'laundry_bag' and p_source = 'storage' then
    if mod(p_quantity::integer, 50) <> 0 or p_quantity <> trunc(p_quantity) then
      raise exception 'Laundry bag and hanger quantities must be in batches of 50';
    end if;

    select quantity
    into current_storage_qty
    from public.storage_supply_levels
    where supply_item = 'laundry_bag'
    for update;

    if current_storage_qty is null then
      raise exception 'Storage stock for laundry_bag is not initialized';
    end if;

    if current_storage_qty < p_quantity then
      raise exception 'Insufficient laundry_bag stock in storage';
    end if;

    update public.storage_supply_levels
    set quantity = quantity - p_quantity::integer
    where supply_item = 'laundry_bag';
  end if;

  insert into public.branch_supply_levels (branch_id, supply_item, quantity)
  values (p_branch_id, p_item, p_quantity)
  on conflict (branch_id, supply_item) do update
  set quantity = branch_supply_levels.quantity + excluded.quantity;

  insert into public.branch_restock_logs (
    branch_id,
    supply_item,
    quantity,
    source_type,
    note,
    created_by
  )
  values (
    p_branch_id,
    p_item,
    p_quantity,
    p_source,
    p_note,
    auth.uid()
  );
end;
$$;

grant execute on function public.admin_restock_branch_supply(uuid, text, numeric, text, text) to authenticated;
