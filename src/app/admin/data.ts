import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type Branch = {
  id: string;
  code: string;
  name: string;
  branch_type: "hub" | "satellite";
  status: "active" | "inactive" | "closed";
  phone_number: string | null;
  is_active: boolean;
};

export type Item = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  is_active: boolean;
};

export type PricingCategory = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type PricingRate = {
  id: string;
  item_id: string;
  pricing_category_id: string | null;
  pricing_model: "itemized" | "weighted";
  unit_price: number | null;
  price_per_kg: number | null;
  is_active: boolean;
};

export type WeightPricingTier = {
  id: string;
  min_kg: number;
  max_kg: number;
  price_per_kg: number;
  is_active: boolean;
};

export type StaffProfile = {
  id: string;
  full_name: string | null;
  role: "admin" | "staff" | "driver";
  branch_id: string | null;
  status: "active" | "inactive" | "terminated";
  is_active: boolean;
};

export type SupplyItem = "dirtex" | "perchlo" | "laundry_bag" | "hanger";

export type BranchSupplyLevel = {
  branch_id: string;
  supply_item: Exclude<SupplyItem, "hanger">;
  quantity: number;
};

export type StorageSupplyLevel = {
  supply_item: "laundry_bag" | "hanger";
  quantity: number;
};

export type BranchSupplySummary = {
  branchId: string;
  branchCode: string;
  branchName: string;
  dirtex: number;
  perchlo: number;
  laundryBag: number;
};

export type BranchRestockLog = {
  id: string;
  branch_id: string;
  supply_item: SupplyItem;
  quantity: number | null;
  source_type: "direct" | "storage";
  note: string | null;
  created_at: string;
};

export async function fetchAdminMasterData() {
  const supabase = createSupabaseAdminClient();
  const [branchesRes, itemsRes, categoriesRes, ratesRes, tiersRes, profilesRes, usersRes] =
    await Promise.all([
      supabase.from("branches").select("*").order("name"),
      supabase.from("items").select("*").order("name"),
      supabase.from("pricing_categories").select("*").order("name"),
      supabase
        .from("pricing_rates")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("weight_pricing_tiers")
        .select("*")
        .order("min_kg", { ascending: true }),
      supabase
        .from("profiles")
        .select("*")
        .in("role", ["admin", "staff", "driver"])
        .order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers(),
    ]);

  return {
    branches: (branchesRes.data ?? []) as Branch[],
    items: (itemsRes.data ?? []) as Item[],
    categories: (categoriesRes.data ?? []) as PricingCategory[],
    rates: (ratesRes.data ?? []) as PricingRate[],
    weightPricingTiers: (tiersRes.data ?? []) as WeightPricingTier[],
    profiles: (profilesRes.data ?? []) as StaffProfile[],
    users: usersRes.data?.users ?? [],
  };
}

export async function fetchAdminInventoryData() {
  const supabase = createSupabaseAdminClient();

  const [branchesRes, levelsRes, storageRes, logsRes, suppliersRes, requestsRes] = await Promise.all([
    supabase
      .from("branches")
      .select("id,code,name,branch_type,status")
      .neq("status", "closed")
      .order("name"),
    supabase.from("branch_supply_levels").select("*"),
    supabase.from("storage_supply_levels").select("*"),
    supabase
      .from("branch_restock_logs")
      .select("id,branch_id,supply_item,quantity,source_type,note,created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("suppliers").select("*").eq("is_active", true).order("company_name"),
    supabase
      .from("branch_supply_requests")
      .select("id,branch_id,supply_item,quantity,status,note,created_at")
      .in("status", ["pending", "approved"])
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const branches = (branchesRes.data ?? []) as Pick<
    Branch,
    "id" | "code" | "name" | "branch_type"
  >[];
  const levels = (levelsRes.data ?? []) as BranchSupplyLevel[];
  const storage = (storageRes.data ?? []) as StorageSupplyLevel[];
  const restockLogs = (logsRes.data ?? []) as BranchRestockLog[];

  const levelByBranch = new Map<string, BranchSupplySummary>();
  for (const branch of branches) {
    levelByBranch.set(branch.id, {
      branchId: branch.id,
      branchCode: branch.code,
      branchName: branch.name,
      dirtex: 0,
      perchlo: 0,
      laundryBag: 0,
    });
  }

  for (const level of levels) {
    const branch = levelByBranch.get(level.branch_id);
    if (!branch) continue;
    if (level.supply_item === "dirtex") {
      branch.dirtex = Number(level.quantity);
    } else if (level.supply_item === "perchlo") {
      branch.perchlo = Number(level.quantity);
    } else if (level.supply_item === "laundry_bag") {
      branch.laundryBag = Number(level.quantity);
    }
  }

  const laundryBagStorageLevel = storage.find((item) => item.supply_item === "laundry_bag");
  const hangerStorageLevel = storage.find((item) => item.supply_item === "hanger");

  const branchNameById = new Map<string, string>();
  branches.forEach((branch) => branchNameById.set(branch.id, branch.name));

  const branchRequests = ((requestsRes.data ?? []) as Array<Omit<BranchSupplyRequest, "branchName">>).map(
    (request) => ({
      ...request,
      branchName: branchNameById.get(request.branch_id) ?? "Unknown branch",
    }),
  );

  return {
    branches,
    hubBranches: branches.filter((branch) => branch.branch_type === "hub"),
    branchLevels: Array.from(levelByBranch.values()).sort((a, b) =>
      a.branchName.localeCompare(b.branchName),
    ),
    storageLaundryBagLevel: laundryBagStorageLevel?.quantity ?? 0,
    storageHangerLevel: hangerStorageLevel?.quantity ?? 0,
    storageByItem: {
      laundry_bag: Number(laundryBagStorageLevel?.quantity ?? 0),
      hanger: Number(hangerStorageLevel?.quantity ?? 0),
    },
    suppliers: (suppliersRes.data ?? []) as Supplier[],
    branchRequests,
    restockLogs: restockLogs.map((log) => ({
      ...log,
      branchName: branchNameById.get(log.branch_id) ?? "Unknown branch",
    })),
  };
}

export type Supplier = {
  id: string;
  company_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
};

export type SupplierReceipt = {
  id: string;
  supplier_id: string;
  supply_item: "dirtex" | "perchlo" | "laundry_bag" | "hanger";
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  note: string | null;
  created_at: string;
};

export type BranchSupplyRequest = {
  id: string;
  branch_id: string;
  supply_item: "hanger" | "laundry_bag";
  quantity: number;
  status: "pending" | "approved" | "fulfilled" | "rejected" | "cancelled";
  note: string | null;
  created_at: string;
  branchName: string;
};

export type FinanceAccount = {
  id: string;
  name: string;
  type: "cash" | "mpesa" | "bank";
  is_active: boolean;
};

export type FinanceBalance = {
  account_id: string;
  name: string;
  type: "cash" | "mpesa" | "bank";
  balance: number;
};

export async function fetchAdminSuppliers() {
  const supabase = createSupabaseAdminClient();
  const res = await supabase.from("suppliers").select("*").order("created_at", { ascending: false });
  return (res.data ?? []) as Supplier[];
}

export async function fetchAdminSupplierReceipts() {
  const supabase = createSupabaseAdminClient();
  const res = await supabase
    .from("storage_receipts")
    .select("id,supplier_id,supply_item,quantity,unit_cost,total_cost,note,created_at")
    .order("created_at", { ascending: false });
  return (res.data ?? []) as SupplierReceipt[];
}

export async function fetchAdminFinancesData() {
  const supabase = createSupabaseAdminClient();
  const [accountsRes, balancesRes, txnsRes, suppliersRes] = await Promise.all([
    supabase.from("finance_accounts").select("*").order("name"),
    supabase.from("v_finance_account_balances").select("*"),
    supabase
      .from("finance_transactions")
      .select("id,txn_type,direction,amount,category,note,created_at,finance_accounts(name)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("suppliers").select("id,company_name,is_active").eq("is_active", true).order("company_name"),
  ]);

  return {
    accounts: (accountsRes.data ?? []) as FinanceAccount[],
    balances: ((balancesRes.data ?? []) as FinanceBalance[]).map((row) => ({ ...row, balance: Number(row.balance) })),
    transactions: (txnsRes.data ?? []) as Array<Record<string, unknown>>,
    activeSuppliers: (suppliersRes.data ?? []) as Array<Pick<Supplier, "id" | "company_name" | "is_active">>,
  };
}
