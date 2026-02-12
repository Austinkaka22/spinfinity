"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { APP_ROLES, normalizeRole } from "@/lib/auth/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function toNullable(value: string): string | null {
  return value.length > 0 ? value : null;
}

function toBoolean(value: string): boolean {
  return value === "on" || value === "true";
}

function normalizeBranchStatus(value: string): "active" | "inactive" | "closed" {
  if (value === "inactive" || value === "closed") {
    return value;
  }
  return "active";
}

function normalizeStaffStatus(value: string): "active" | "inactive" | "terminated" {
  if (value === "inactive" || value === "terminated") {
    return value;
  }
  return "active";
}

function normalizeItemStatus(value: string): "active" | "inactive" {
  if (value === "inactive") {
    return value;
  }
  return "active";
}

async function requireAdmin() {
  await requireRole("admin");
}

function refreshAdminPortal() {
  const paths = [
    "/admin",
    "/admin/registry/branches",
    "/admin/registry/staff",
    "/admin/registry/items",
    "/admin/registry/customers",
    "/admin/supplies/suppliers",
    "/admin/supplies/inventory",
    "/admin/finance/pricing",
    "/admin/finance/finances",
    "/admin/branches",
    "/admin/staff",
    "/admin/items",
    "/admin/inventory",
    "/admin/pricing",
    "/admin/customers",
    "/admin/reports",
  ] as const;
  paths.forEach((path) => revalidatePath(path));
}

function normalizeSupplyItem(value: string): "dirtex" | "perchlo" | "laundry_bag" | "hanger" {
  if (value === "perchlo" || value === "laundry_bag" || value === "hanger") {
    return value;
  }
  return "dirtex";
}

function normalizeSupplySource(value: string): "direct" | "storage" {
  if (value === "storage") {
    return "storage";
  }
  return "direct";
}

function toPositiveNumber(value: string): number {
  const normalized = Number.parseFloat(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error("Quantity must be a positive number");
  }
  return normalized;
}

function toPositiveBatchQuantity(value: string): number {
  const normalized = Number.parseInt(value, 10);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error("Quantity must be a positive whole number");
  }
  if (normalized % 50 !== 0) {
    throw new Error("Laundry Bag and hanger quantities must be in batches of 50");
  }
  return normalized;
}

export async function createBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const code = readField(formData, "code").toUpperCase();
  const name = readField(formData, "name");
  const branchType = readField(formData, "branch_type");
  const status = normalizeBranchStatus(readField(formData, "status"));
  const phoneNumber = toNullable(readField(formData, "phone_number"));

  await supabase.from("branches").insert({
    code,
    name,
    branch_type: branchType,
    status,
    phone_number: phoneNumber,
    is_active: status === "active",
  });

  refreshAdminPortal();
}

export async function updateBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const id = readField(formData, "id");
  const code = readField(formData, "code").toUpperCase();
  const name = readField(formData, "name");
  const branchType = readField(formData, "branch_type");
  const status = normalizeBranchStatus(readField(formData, "status"));
  const phoneNumber = toNullable(readField(formData, "phone_number"));

  await supabase
    .from("branches")
    .update({
      code,
      name,
      branch_type: branchType,
      status,
      phone_number: phoneNumber,
      is_active: status === "active",
    })
    .eq("id", id);

  refreshAdminPortal();
}

export async function deleteBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");

  await supabase.from("branches").delete().eq("id", id);
  refreshAdminPortal();
}

export async function createItemAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const name = readField(formData, "name");
  const description = toNullable(readField(formData, "description"));
  const status = normalizeItemStatus(readField(formData, "status"));
  const isActive = status === "active";

  await supabase.from("items").insert({
    name,
    description,
    status,
    is_active: isActive,
  });

  refreshAdminPortal();
}

export async function updateItemAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const id = readField(formData, "id");
  const name = readField(formData, "name");
  const description = toNullable(readField(formData, "description"));
  const status = normalizeItemStatus(readField(formData, "status"));
  const isActive = status === "active";

  await supabase
    .from("items")
    .update({
      name,
      description,
      status,
      is_active: isActive,
    })
    .eq("id", id);

  refreshAdminPortal();
}

export async function deleteItemAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");

  await supabase.from("items").delete().eq("id", id);
  refreshAdminPortal();
}

export async function createPricingCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const name = readField(formData, "name");
  const description = toNullable(readField(formData, "description"));
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase.from("pricing_categories").insert({
    name,
    description,
    is_active: isActive,
  });

  refreshAdminPortal();
}

export async function updatePricingCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const id = readField(formData, "id");
  const name = readField(formData, "name");
  const description = toNullable(readField(formData, "description"));
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase
    .from("pricing_categories")
    .update({
      name,
      description,
      is_active: isActive,
    })
    .eq("id", id);

  refreshAdminPortal();
}

export async function deletePricingCategoryAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");

  await supabase.from("pricing_categories").delete().eq("id", id);
  refreshAdminPortal();
}

export async function createPricingRateAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const itemId = readField(formData, "item_id");
  const categoryId = toNullable(readField(formData, "pricing_category_id"));
  const unitPriceInput = toNullable(readField(formData, "unit_price"));
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase.from("pricing_rates").insert({
    item_id: itemId,
    pricing_category_id: categoryId,
    pricing_model: "itemized",
    unit_price: unitPriceInput,
    price_per_kg: null,
    is_active: isActive,
  });

  refreshAdminPortal();
}

export async function updatePricingRateAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const id = readField(formData, "id");
  const categoryId = toNullable(readField(formData, "pricing_category_id"));
  const unitPriceInput = toNullable(readField(formData, "unit_price"));
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase
    .from("pricing_rates")
    .update({
      pricing_category_id: categoryId,
      pricing_model: "itemized",
      unit_price: unitPriceInput,
      price_per_kg: null,
      is_active: isActive,
    })
    .eq("id", id);

  refreshAdminPortal();
}

export async function deletePricingRateAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");

  await supabase.from("pricing_rates").delete().eq("id", id);
  refreshAdminPortal();
}

export async function createWeightPricingTierAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const minKg = readField(formData, "min_kg");
  const maxKg = readField(formData, "max_kg");
  const pricePerKg = readField(formData, "price_per_kg");
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase.from("weight_pricing_tiers").insert({
    min_kg: minKg,
    max_kg: maxKg,
    price_per_kg: pricePerKg,
    is_active: isActive,
  });

  refreshAdminPortal();
}

export async function updateWeightPricingTierAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const id = readField(formData, "id");
  const minKg = readField(formData, "min_kg");
  const maxKg = readField(formData, "max_kg");
  const pricePerKg = readField(formData, "price_per_kg");
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase
    .from("weight_pricing_tiers")
    .update({
      min_kg: minKg,
      max_kg: maxKg,
      price_per_kg: pricePerKg,
      is_active: isActive,
    })
    .eq("id", id);

  refreshAdminPortal();
}

export async function deleteWeightPricingTierAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");

  await supabase.from("weight_pricing_tiers").delete().eq("id", id);
  refreshAdminPortal();
}

export async function createStaffAccountAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const email = readField(formData, "email").toLowerCase();
  const fullName = readField(formData, "full_name");
  const role = normalizeRole(readField(formData, "role"));
  const branchIdInput = toNullable(readField(formData, "branch_id"));
  const status = normalizeStaffStatus(readField(formData, "status"));
  const isActive = status === "active";
  const branchId = role === "staff" ? branchIdInput : null;

  if (!role || !APP_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  if (role === "staff" && !branchId) {
    throw new Error("Staff must have branch assignment");
  }

  const redirectToBase = process.env.NEXT_PUBLIC_SITE_URL;
  const redirectTo = redirectToBase ? `${redirectToBase.replace(/\/$/, "")}/sign-in` : undefined;

  const { data: authUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      full_name: fullName,
      role,
      branch_id: branchId,
      status,
    },
  });

  if (authError || !authUser.user) {
    throw new Error(authError?.message ?? "Failed to invite auth user");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authUser.user.id,
    full_name: fullName,
    email,
    role,
    branch_id: branchId,
    status,
    is_active: isActive,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(profileError.message);
  }

  refreshAdminPortal();
}

export async function updateStaffAccountAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const id = readField(formData, "id");
  const fullName = readField(formData, "full_name");
  const role = normalizeRole(readField(formData, "role"));
  const branchIdInput = toNullable(readField(formData, "branch_id"));
  const status = normalizeStaffStatus(readField(formData, "status"));
  const isActive = status === "active";
  const branchId = role === "staff" ? branchIdInput : null;

  if (!role || !APP_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  if (role === "staff" && !branchId) {
    throw new Error("Staff must have branch assignment");
  }

  await supabase.from("profiles").update({
    full_name: fullName,
    role,
    branch_id: branchId,
    status,
    is_active: isActive,
  }).eq("id", id);

  refreshAdminPortal();
}

export async function receiveStorageSupplyAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const item = normalizeSupplyItem(readField(formData, "supply_item"));
  const quantity = toPositiveBatchQuantity(readField(formData, "quantity"));
  const note = toNullable(readField(formData, "note"));

  if (item !== "laundry_bag" && item !== "hanger") {
    throw new Error("Only Laundry Bags and hangers can be received into storage");
  }

  const { error } = await supabase.rpc("admin_receive_storage_supply", {
    p_item: item,
    p_quantity: quantity,
    p_note: note,
  });

  if (error) {
    throw new Error(error.message);
  }

  refreshAdminPortal();
}

export async function restockBranchDirectSupplyAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const branchId = readField(formData, "branch_id");
  const item = normalizeSupplyItem(readField(formData, "supply_item"));
  const quantity = toPositiveNumber(readField(formData, "quantity"));
  const note = toNullable(readField(formData, "note"));

  if (!branchId) {
    throw new Error("Branch is required");
  }
  if (item !== "dirtex" && item !== "perchlo") {
    throw new Error("Direct branch restock supports Dirtex and Perchlo only");
  }

  const { error } = await supabase.rpc("admin_restock_branch_supply", {
    p_branch_id: branchId,
    p_item: item,
    p_quantity: quantity,
    p_source: "direct",
    p_note: note,
  });

  if (error) {
    throw new Error(error.message);
  }

  refreshAdminPortal();
}

export async function restockBranchFromStorageAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const branchId = readField(formData, "branch_id");
  const item = normalizeSupplyItem(readField(formData, "supply_item"));
  const source = normalizeSupplySource(readField(formData, "source"));
  const quantity = toPositiveBatchQuantity(readField(formData, "quantity"));
  const note = toNullable(readField(formData, "note"));

  if (!branchId) {
    throw new Error("Branch is required");
  }
  if (source !== "storage") {
    throw new Error("Storage restock source must be storage");
  }
  if (item !== "laundry_bag" && item !== "hanger") {
    throw new Error("Storage restock supports Laundry Bags and hangers only");
  }

  const { error } = await supabase.rpc("admin_restock_branch_supply", {
    p_branch_id: branchId,
    p_item: item,
    p_quantity: quantity,
    p_source: source,
    p_note: note,
  });

  if (error) {
    throw new Error(error.message);
  }

  refreshAdminPortal();
}

function toMoney(value: string): number {
  const normalized = Number.parseFloat(value);
  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error("Amount must be greater than zero");
  }
  return normalized;
}

export async function createSupplierAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const companyName = readField(formData, "company_name");
  if (!companyName) throw new Error("Company name is required");

  const { error } = await supabase.from("suppliers").insert({
    company_name: companyName,
    contact_name: toNullable(readField(formData, "contact_name")),
    phone: toNullable(readField(formData, "phone")),
    email: toNullable(readField(formData, "email")),
  });

  if (error) throw new Error(error.message);
  refreshAdminPortal();
}

export async function updateSupplierAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");
  if (!id) throw new Error("Supplier is required");

  const { error } = await supabase.from("suppliers").update({
    company_name: readField(formData, "company_name"),
    contact_name: toNullable(readField(formData, "contact_name")),
    phone: toNullable(readField(formData, "phone")),
    email: toNullable(readField(formData, "email")),
    is_active: toBoolean(readField(formData, "is_active")),
  }).eq("id", id);

  if (error) throw new Error(error.message);
  refreshAdminPortal();
}

export async function receiveToStorageAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const supplierId = readField(formData, "supplier_id");
  const item = normalizeSupplyItem(readField(formData, "supply_item"));
  const quantity = toPositiveNumber(readField(formData, "quantity"));
  const unitCostInput = toNullable(readField(formData, "unit_cost"));
  const note = toNullable(readField(formData, "note"));

  if (!supplierId) throw new Error("Supplier is required");
  if (item !== "hanger" && item !== "laundry_bag") throw new Error("Invalid storage item");

  const unitCost = unitCostInput ? toMoney(unitCostInput) : null;
  const totalCost = unitCost != null ? Number((unitCost * quantity).toFixed(2)) : null;

  const { data: receipt, error: receiptError } = await supabase.from("storage_receipts").insert({
    supplier_id: supplierId,
    supply_item: item,
    quantity,
    unit_cost: unitCost,
    total_cost: totalCost,
    note,
  }).select("id").single();
  if (receiptError || !receipt) throw new Error(receiptError?.message ?? "Failed to save receipt");

  const { data: currentStorage } = await supabase.from("storage_supply_levels").select("quantity").eq("supply_item", item).maybeSingle();
  const nextQty = Number(currentStorage?.quantity ?? 0) + Math.trunc(quantity);

  const { error: storageError } = await supabase.from("storage_supply_levels").upsert({
    supply_item: item,
    quantity: nextQty,
  }, { onConflict: "supply_item" });
  if (storageError) throw new Error(storageError.message);

  await supabase.from("supply_movements").insert({
    movement_type: "RECEIVE_TO_STORAGE",
    supply_item: item,
    qty_change: quantity,
    from_location: "supplier",
    to_location: "storage",
    supplier_id: supplierId,
    related_table: "storage_receipts",
    related_id: receipt.id,
    note,
  });

  refreshAdminPortal();
}

export async function branchRestockAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const branchId = readField(formData, "branch_id");
  const item = normalizeSupplyItem(readField(formData, "supply_item"));
  const quantity = Math.trunc(toPositiveNumber(readField(formData, "quantity")));
  const note = toNullable(readField(formData, "note"));
  const requestId = toNullable(readField(formData, "request_id"));

  if (!branchId) throw new Error("Branch is required");
  if (item !== "hanger" && item !== "laundry_bag") throw new Error("Only hanger and laundry bag can move from storage");

  const { data: storage, error: storageReadError } = await supabase
    .from("storage_supply_levels")
    .select("quantity")
    .eq("supply_item", item)
    .single();
  if (storageReadError) throw new Error(storageReadError.message);
  const available = Number(storage.quantity);
  if (quantity > available) throw new Error("Quantity exceeds available storage stock");

  const { error: storageUpdateError } = await supabase
    .from("storage_supply_levels")
    .update({ quantity: available - quantity })
    .eq("supply_item", item);
  if (storageUpdateError) throw new Error(storageUpdateError.message);

  const { data: branchLevel } = await supabase
    .from("branch_supply_levels")
    .select("quantity")
    .eq("branch_id", branchId)
    .eq("supply_item", item)
    .maybeSingle();

  const nextBranchQty = Number(branchLevel?.quantity ?? 0) + quantity;
  const { error: branchUpdateError } = await supabase.from("branch_supply_levels").upsert({
    branch_id: branchId,
    supply_item: item,
    quantity: nextBranchQty,
  }, { onConflict: "branch_id,supply_item" });
  if (branchUpdateError) throw new Error(branchUpdateError.message);

  const { data: restockLog, error: logError } = await supabase.from("branch_restock_logs").insert({
    branch_id: branchId,
    supply_item: item,
    quantity,
    source_type: "storage",
    note,
    related_request_id: requestId,
  }).select("id").single();

  if (logError || !restockLog) throw new Error(logError?.message ?? "Failed to log restock");

  await supabase.from("supply_movements").insert({
    movement_type: "TRANSFER_TO_BRANCH",
    supply_item: item,
    qty_change: -quantity,
    from_location: "storage",
    to_location: `branch:${branchId}`,
    branch_id: branchId,
    related_table: "branch_restock_logs",
    related_id: restockLog.id,
    note,
  });

  if (requestId) {
    await supabase.from("branch_supply_requests").update({
      status: "fulfilled",
      actioned_by: (await supabase.auth.getUser()).data.user?.id ?? null,
    }).eq("id", requestId);
  }

  refreshAdminPortal();
}

export async function rejectBranchSupplyRequestAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const requestId = readField(formData, "request_id");
  if (!requestId) throw new Error("Request id is required");

  await supabase.from("branch_supply_requests").update({
    status: "rejected",
    note: toNullable(readField(formData, "note")),
    actioned_by: (await supabase.auth.getUser()).data.user?.id ?? null,
  }).eq("id", requestId);

  refreshAdminPortal();
}

export async function createFinanceAccountAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const name = readField(formData, "name");
  const type = readField(formData, "type");
  if (!name) throw new Error("Account name is required");

  await supabase.from("finance_accounts").insert({ name, type, is_active: toBoolean(readField(formData, "is_active")) });
  refreshAdminPortal();
}

export async function updateFinanceAccountAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");
  await supabase.from("finance_accounts").update({
    name: readField(formData, "name"),
    type: readField(formData, "type"),
    is_active: toBoolean(readField(formData, "is_active")),
  }).eq("id", id);
  refreshAdminPortal();
}

export async function createFinanceReceiveAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  await supabase.from("finance_transactions").insert({
    txn_type: "receive",
    direction: "in",
    account_id: readField(formData, "account_id"),
    amount: toMoney(readField(formData, "amount")),
    note: toNullable(readField(formData, "note")),
  });
  refreshAdminPortal();
}

export async function createFinanceExpenseAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const category = readField(formData, "category");
  if (!category) throw new Error("Category is required");

  await supabase.from("finance_transactions").insert({
    txn_type: "expense",
    direction: "out",
    account_id: readField(formData, "account_id"),
    amount: toMoney(readField(formData, "amount")),
    category,
    supplier_id: toNullable(readField(formData, "supplier_id")),
    note: toNullable(readField(formData, "note")),
  });
  refreshAdminPortal();
}

export async function createFinanceAdjustmentAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  await supabase.from("finance_transactions").insert({
    txn_type: "adjustment",
    direction: readField(formData, "direction") === "out" ? "out" : "in",
    account_id: readField(formData, "account_id"),
    amount: toMoney(readField(formData, "amount")),
    note: toNullable(readField(formData, "note")),
  });
  refreshAdminPortal();
}
