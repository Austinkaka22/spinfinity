-- Inventory stock movement refinements, branch direct receipts, and supplier payments.

alter table public.storage_receipts
  drop constraint if exists storage_receipts_supply_item_check;

alter table public.storage_receipts
  add constraint storage_receipts_supply_item_check
  check (supply_item in ('hanger', 'laundry_bag'));

alter table public.branch_supply_levels
  drop constraint if exists branch_supply_levels_supply_item_check;

alter table public.branch_supply_levels
  add constraint branch_supply_levels_supply_item_check
  check (supply_item in ('dirtex', 'perchlo', 'laundry_bag', 'hanger'));

insert into public.branch_supply_levels (branch_id, supply_item, quantity)
select b.id, 'hanger', 0
from public.branches b
on conflict (branch_id, supply_item) do nothing;

create table if not exists public.branch_direct_receipts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete restrict,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  supply_item text not null check (supply_item in ('dirtex', 'perchlo')),
  quantity numeric(12,2) not null check (quantity > 0),
  total_cost numeric(12,2) not null check (total_cost > 0),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists branch_direct_receipts_branch_created_idx
  on public.branch_direct_receipts (branch_id, created_at desc);
create index if not exists branch_direct_receipts_supplier_created_idx
  on public.branch_direct_receipts (supplier_id, created_at desc);

alter table public.supply_movements
  drop constraint if exists supply_movements_movement_type_check;

alter table public.supply_movements
  add constraint supply_movements_movement_type_check
  check (movement_type in ('RECEIVE_TO_STORAGE','RECEIVE_TO_BRANCH','STORAGE_TO_BRANCH','TRANSFER_TO_BRANCH','ADJUSTMENT'));

create unique index if not exists branch_restock_logs_unique_related_request_idx
  on public.branch_restock_logs (related_request_id)
  where related_request_id is not null;

create table if not exists public.supplier_payments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  bank_account_id uuid not null references public.finance_accounts(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  paid_at timestamptz not null default now(),
  reference text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists supplier_payments_supplier_paid_at_idx
  on public.supplier_payments (supplier_id, paid_at desc);

create or replace function public.ensure_supplier_payment_bank_account()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.finance_accounts fa
    where fa.id = new.bank_account_id
      and fa.type = 'bank'
  ) then
    raise exception 'Supplier payments must use a bank account';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_supplier_payments_bank_only on public.supplier_payments;
create trigger trg_supplier_payments_bank_only
before insert or update on public.supplier_payments
for each row execute procedure public.ensure_supplier_payment_bank_account();

create or replace view public.v_supplier_balances as
select
  s.id as supplier_id,
  coalesce(sr.total_purchased, 0)::numeric(12,2) as total_purchased,
  coalesce(sp.total_paid, 0)::numeric(12,2) as total_paid,
  (coalesce(sr.total_purchased, 0) - coalesce(sp.total_paid, 0))::numeric(12,2) as balance
from public.suppliers s
left join (
  select
    supplier_id,
    sum(total_cost) as total_purchased
  from (
    select supplier_id, total_cost from public.storage_receipts where total_cost is not null
    union all
    select supplier_id, total_cost from public.branch_direct_receipts
  ) purchases
  group by supplier_id
) sr on sr.supplier_id = s.id
left join (
  select supplier_id, sum(amount) as total_paid
  from public.supplier_payments
  group by supplier_id
) sp on sp.supplier_id = s.id;

alter table public.branch_direct_receipts enable row level security;
alter table public.supplier_payments enable row level security;

drop policy if exists branch_direct_receipts_read_authenticated on public.branch_direct_receipts;
create policy branch_direct_receipts_read_authenticated on public.branch_direct_receipts
for select to authenticated using (true);

drop policy if exists branch_direct_receipts_write_admin on public.branch_direct_receipts;
create policy branch_direct_receipts_write_admin on public.branch_direct_receipts
for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists supplier_payments_read_authenticated on public.supplier_payments;
create policy supplier_payments_read_authenticated on public.supplier_payments
for select to authenticated using (true);

drop policy if exists supplier_payments_write_admin on public.supplier_payments;
create policy supplier_payments_write_admin on public.supplier_payments
for all to authenticated using (public.is_admin()) with check (public.is_admin());
