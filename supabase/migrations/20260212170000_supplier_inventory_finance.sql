-- Suppliers, branch requests, storage receipts, supply movements, and finance models.

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.branch_supply_requests (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  supply_item text not null check (supply_item in ('hanger','laundry_bag')),
  quantity integer not null check (quantity > 0),
  status text not null default 'pending' check (status in ('pending','approved','fulfilled','rejected','cancelled')),
  note text,
  requested_by uuid references auth.users(id) on delete set null,
  actioned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists branch_supply_requests_branch_status_created_idx
  on public.branch_supply_requests (branch_id, status, created_at desc);

create table if not exists public.storage_receipts (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  supply_item text not null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_cost numeric(12,2),
  total_cost numeric(12,2),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists storage_receipts_supplier_created_idx
  on public.storage_receipts (supplier_id, created_at desc);
create index if not exists storage_receipts_supply_item_idx
  on public.storage_receipts (supply_item);

create table if not exists public.supply_movements (
  id uuid primary key default gen_random_uuid(),
  movement_type text not null check (movement_type in ('RECEIVE_TO_STORAGE','TRANSFER_TO_BRANCH','ADJUSTMENT')),
  supply_item text not null,
  qty_change numeric(12,2) not null,
  from_location text,
  to_location text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  branch_id uuid references public.branches(id) on delete set null,
  related_table text,
  related_id uuid,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists supply_movements_type_created_idx
  on public.supply_movements (movement_type, created_at desc);
create index if not exists supply_movements_item_created_idx
  on public.supply_movements (supply_item, created_at desc);
create index if not exists supply_movements_branch_created_idx
  on public.supply_movements (branch_id, created_at desc);

alter table public.branch_restock_logs
  add column if not exists related_request_id uuid references public.branch_supply_requests(id) on delete set null,
  add column if not exists supplier_id uuid references public.suppliers(id) on delete set null;

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('cash','mpesa','bank')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  txn_type text not null check (txn_type in ('receive','expense','adjustment')),
  account_id uuid not null references public.finance_accounts(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  direction text not null check (direction in ('in','out')),
  category text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists finance_transactions_account_created_idx
  on public.finance_transactions (account_id, created_at desc);
create index if not exists finance_transactions_type_created_idx
  on public.finance_transactions (txn_type, created_at desc);
create index if not exists finance_transactions_supplier_created_idx
  on public.finance_transactions (supplier_id, created_at desc);

create or replace view public.v_finance_account_balances as
select
  a.id as account_id,
  a.name,
  a.type,
  coalesce(sum(case when t.direction = 'in' then t.amount else -t.amount end), 0)::numeric(12,2) as balance
from public.finance_accounts a
left join public.finance_transactions t on t.account_id = a.id
group by a.id, a.name, a.type;

alter table public.suppliers enable row level security;
alter table public.branch_supply_requests enable row level security;
alter table public.storage_receipts enable row level security;
alter table public.supply_movements enable row level security;
alter table public.finance_accounts enable row level security;
alter table public.finance_transactions enable row level security;

create trigger trg_suppliers_updated_at before update on public.suppliers
for each row execute procedure public.set_updated_at();
create trigger trg_branch_supply_requests_updated_at before update on public.branch_supply_requests
for each row execute procedure public.set_updated_at();
create trigger trg_finance_accounts_updated_at before update on public.finance_accounts
for each row execute procedure public.set_updated_at();

-- Admin policies
create policy suppliers_read_authenticated on public.suppliers for select to authenticated using (true);
create policy suppliers_write_admin on public.suppliers for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy storage_receipts_read_authenticated on public.storage_receipts for select to authenticated using (true);
create policy storage_receipts_write_admin on public.storage_receipts for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy supply_movements_read_authenticated on public.supply_movements for select to authenticated using (true);
create policy supply_movements_write_admin on public.supply_movements for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy finance_accounts_read_authenticated on public.finance_accounts for select to authenticated using (true);
create policy finance_accounts_write_admin on public.finance_accounts for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy finance_transactions_read_authenticated on public.finance_transactions for select to authenticated using (true);
create policy finance_transactions_write_admin on public.finance_transactions for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Branch request policies
create policy branch_supply_requests_read on public.branch_supply_requests
for select to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role = 'staff'
      and p.branch_id = branch_supply_requests.branch_id
      and p.is_active = true
  )
);

create policy branch_supply_requests_insert_branch_staff on public.branch_supply_requests
for insert to authenticated
with check (
  public.is_admin()
  or (
    requested_by = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'staff'
        and p.branch_id = branch_supply_requests.branch_id
        and p.is_active = true
    )
  )
);

create policy branch_supply_requests_update_admin on public.branch_supply_requests
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into public.finance_accounts (name, type)
values ('Cash', 'cash'), ('Mpesa', 'mpesa'), ('Bank', 'bank')
on conflict do nothing;
