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

async function requireAdmin() {
  await requireRole("admin");
}

function refreshAdminPortal() {
  revalidatePath("/admin");
}

export async function createBranchAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const code = readField(formData, "code").toUpperCase();
  const name = readField(formData, "name");
  const branchType = readField(formData, "branch_type");
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase.from("branches").insert({
    code,
    name,
    branch_type: branchType,
    is_active: isActive,
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
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase
    .from("branches")
    .update({
      code,
      name,
      branch_type: branchType,
      is_active: isActive,
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
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase.from("items").insert({
    name,
    description,
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
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase
    .from("items")
    .update({
      name,
      description,
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
  const pricingModel = readField(formData, "pricing_model");
  const unitPriceInput = toNullable(readField(formData, "unit_price"));
  const perKgInput = toNullable(readField(formData, "price_per_kg"));
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase.from("pricing_rates").insert({
    item_id: itemId,
    pricing_category_id: categoryId,
    pricing_model: pricingModel,
    unit_price: unitPriceInput,
    price_per_kg: perKgInput,
    is_active: isActive,
  });

  refreshAdminPortal();
}

export async function updatePricingRateAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const id = readField(formData, "id");
  const categoryId = toNullable(readField(formData, "pricing_category_id"));
  const pricingModel = readField(formData, "pricing_model");
  const unitPriceInput = toNullable(readField(formData, "unit_price"));
  const perKgInput = toNullable(readField(formData, "price_per_kg"));
  const isActive = toBoolean(readField(formData, "is_active"));

  await supabase
    .from("pricing_rates")
    .update({
      pricing_category_id: categoryId,
      pricing_model: pricingModel,
      unit_price: unitPriceInput,
      price_per_kg: perKgInput,
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

export async function createStaffAccountAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();

  const email = readField(formData, "email").toLowerCase();
  const password = readField(formData, "password");
  const fullName = readField(formData, "full_name");
  const role = normalizeRole(readField(formData, "role"));
  const branchId = toNullable(readField(formData, "branch_id"));

  if (!role || !APP_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  if (role === "staff" && !branchId) {
    throw new Error("Staff must have branch assignment");
  }

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
        branch_id: role === "staff" ? branchId : null,
      },
    });

  if (authError || !authUser.user) {
    throw new Error(authError?.message ?? "Failed to create auth user");
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: authUser.user.id,
    full_name: fullName,
    role,
    branch_id: role === "staff" ? branchId : null,
    is_active: true,
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
  const branchId = toNullable(readField(formData, "branch_id"));
  const isActive = toBoolean(readField(formData, "is_active"));

  if (!role || !APP_ROLES.includes(role)) {
    throw new Error("Invalid role");
  }

  if (role === "staff" && !branchId) {
    throw new Error("Staff must have branch assignment");
  }

  await supabase.from("profiles").update({
    full_name: fullName,
    role,
    branch_id: role === "staff" ? branchId : null,
    is_active: isActive,
  }).eq("id", id);

  refreshAdminPortal();
}

export async function deactivateStaffAccountAction(formData: FormData) {
  await requireAdmin();
  const supabase = createSupabaseAdminClient();
  const id = readField(formData, "id");

  await supabase.from("profiles").update({
    is_active: false,
  }).eq("id", id);

  refreshAdminPortal();
}
