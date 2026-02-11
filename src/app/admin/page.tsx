import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  createBranchAction,
  deactivateStaffAccountAction,
  deleteBranchAction,
  deleteItemAction,
  deletePricingCategoryAction,
  deletePricingRateAction,
  createItemAction,
  createPricingCategoryAction,
  createPricingRateAction,
  createStaffAccountAction,
  updateBranchAction,
  updateItemAction,
  updatePricingCategoryAction,
  updatePricingRateAction,
  updateStaffAccountAction,
} from "@/app/admin/actions";

type Branch = {
  id: string;
  code: string;
  name: string;
  branch_type: "hub" | "satellite";
  is_active: boolean;
};

type Item = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

type PricingCategory = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

type PricingRate = {
  id: string;
  item_id: string;
  pricing_category_id: string | null;
  pricing_model: "itemized" | "weighted";
  unit_price: number | null;
  price_per_kg: number | null;
  is_active: boolean;
};

type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "staff" | "driver";
  branch_id: string | null;
  is_active: boolean;
};

function formatKES(value: number | null) {
  if (value === null) return "-";
  return `KES ${Number(value).toFixed(2)}`;
}

export default async function AdminPage() {
  const session = await requireRole("admin");
  const supabase = createSupabaseAdminClient();

  const [branchesRes, itemsRes, categoriesRes, ratesRes, profilesRes, usersRes] =
    await Promise.all([
      supabase.from("branches").select("*").order("name"),
      supabase.from("items").select("*").order("name"),
      supabase.from("pricing_categories").select("*").order("name"),
      supabase.from("pricing_rates").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.auth.admin.listUsers(),
    ]);

  const branches = (branchesRes.data ?? []) as Branch[];
  const items = (itemsRes.data ?? []) as Item[];
  const categories = (categoriesRes.data ?? []) as PricingCategory[];
  const rates = (ratesRes.data ?? []) as PricingRate[];
  const profiles = (profilesRes.data ?? []) as Profile[];
  const users = usersRes.data?.users ?? [];
  const emailByUserId = new Map(users.map((user) => [user.id, user.email ?? ""]));
  const itemById = new Map(items.map((item) => [item.id, item]));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const branchById = new Map(branches.map((branch) => [branch.id, branch]));

  return (
    <PortalShell
      role={session.role}
      branchId={session.branchId}
      title="Admin Portal"
      description="Milestone 2 master data: branches, staff, items, categories, and pricing rates."
    >
      <div className="space-y-8">
        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Branches</h2>
          <form action={createBranchAction} className="mt-4 grid gap-2 md:grid-cols-5">
            <input
              name="code"
              placeholder="Code (BUR)"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="name"
              placeholder="Branch name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <select
              name="branch_type"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              defaultValue="hub"
            >
              <option value="hub">Hub</option>
              <option value="satellite">Satellite</option>
            </select>
            <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Active
            </label>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Create Branch
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {branches.map((branch) => (
              <form
                key={branch.id}
                action={updateBranchAction}
                className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-7"
              >
                <input type="hidden" name="id" value={branch.id} />
                <input
                  name="code"
                  defaultValue={branch.code}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  name="name"
                  defaultValue={branch.name}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <select
                  name="branch_type"
                  defaultValue={branch.branch_type}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="hub">Hub</option>
                  <option value="satellite">Satellite</option>
                </select>
                <label className="flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={branch.is_active} />
                  Active
                </label>
                <button className="rounded-md border border-slate-300 px-3 py-1 text-sm">
                  Save
                </button>
                <button
                  formAction={deleteBranchAction}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
                >
                  Delete
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Staff Accounts</h2>
          <form action={createStaffAccountAction} className="mt-4 grid gap-2 md:grid-cols-7">
            <input
              name="full_name"
              placeholder="Full name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Temp password"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <select
              name="role"
              defaultValue="staff"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
            </select>
            <select
              name="branch_id"
              defaultValue=""
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">No branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <div className="md:col-span-2">
              <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Create Staff Account
              </button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
            {profiles.map((profile) => (
              <form
                key={profile.id}
                action={updateStaffAccountAction}
                className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-7"
              >
                <input type="hidden" name="id" value={profile.id} />
                <div className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
                  {emailByUserId.get(profile.id) || profile.id}
                </div>
                <input
                  name="full_name"
                  defaultValue={profile.full_name ?? ""}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <select
                  name="role"
                  defaultValue={profile.role}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="driver">Driver</option>
                </select>
                <select
                  name="branch_id"
                  defaultValue={profile.branch_id ?? ""}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="">No branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={profile.is_active} />
                  Active
                </label>
                <button className="rounded-md border border-slate-300 px-3 py-1 text-sm">
                  Save
                </button>
                <button
                  formAction={deactivateStaffAccountAction}
                  className="rounded-md border border-amber-300 px-3 py-1 text-sm text-amber-700"
                >
                  Deactivate
                </button>
                <div className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">
                  {profile.branch_id ? branchById.get(profile.branch_id)?.name : "No branch"}
                </div>
              </form>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Items</h2>
          <form action={createItemAction} className="mt-4 grid gap-2 md:grid-cols-4">
            <input
              name="name"
              placeholder="Item name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="description"
              placeholder="Description"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Active
            </label>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Create Item
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {items.map((item) => (
              <form
                key={item.id}
                action={updateItemAction}
                className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-4"
              >
                <input type="hidden" name="id" value={item.id} />
                <input
                  name="name"
                  defaultValue={item.name}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  name="description"
                  defaultValue={item.description ?? ""}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={item.is_active} />
                  Active
                </label>
                <button className="rounded-md border border-slate-300 px-3 py-1 text-sm">
                  Save
                </button>
                <button
                  formAction={deleteItemAction}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
                >
                  Delete
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Pricing Categories</h2>
          <form action={createPricingCategoryAction} className="mt-4 grid gap-2 md:grid-cols-4">
            <input
              name="name"
              placeholder="Category name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="description"
              placeholder="Description"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Active
            </label>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Create Category
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {categories.map((category) => (
              <form
                key={category.id}
                action={updatePricingCategoryAction}
                className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-4"
              >
                <input type="hidden" name="id" value={category.id} />
                <input
                  name="name"
                  defaultValue={category.name}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  name="description"
                  defaultValue={category.description ?? ""}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={category.is_active} />
                  Active
                </label>
                <button className="rounded-md border border-slate-300 px-3 py-1 text-sm">
                  Save
                </button>
                <button
                  formAction={deletePricingCategoryAction}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
                >
                  Delete
                </button>
              </form>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Pricing Rates</h2>
          <form action={createPricingRateAction} className="mt-4 grid gap-2 md:grid-cols-6">
            <select
              name="item_id"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select item
              </option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              name="pricing_category_id"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              name="pricing_model"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              defaultValue="itemized"
            >
              <option value="itemized">Itemized</option>
              <option value="weighted">Weighted</option>
            </select>
            <input
              name="unit_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Unit price"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="price_per_kg"
              type="number"
              step="0.01"
              min="0"
              placeholder="Price / Kg"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm">
              <input type="checkbox" name="is_active" defaultChecked />
              Active
            </label>
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white md:col-span-6">
              Create Rate
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {rates.map((rate) => (
              <form
                key={rate.id}
                action={updatePricingRateAction}
                className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-7"
              >
                <input type="hidden" name="id" value={rate.id} />
                <div className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700">
                  {itemById.get(rate.item_id)?.name ?? rate.item_id}
                </div>
                <select
                  name="pricing_category_id"
                  defaultValue={rate.pricing_category_id ?? ""}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <select
                  name="pricing_model"
                  defaultValue={rate.pricing_model}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="itemized">Itemized</option>
                  <option value="weighted">Weighted</option>
                </select>
                <input
                  name="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={rate.unit_price ?? ""}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  name="price_per_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={rate.price_per_kg ?? ""}
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
                <label className="flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={rate.is_active} />
                  Active
                </label>
                <button className="rounded-md border border-slate-300 px-3 py-1 text-sm">
                  Save
                </button>
                <button
                  formAction={deletePricingRateAction}
                  className="rounded-md border border-red-300 px-3 py-1 text-sm text-red-700"
                >
                  Delete
                </button>
                <div className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 md:col-span-7">
                  Category: {rate.pricing_category_id ? categoryById.get(rate.pricing_category_id)?.name : "No category"} | Model: {rate.pricing_model} | Unit: {formatKES(rate.unit_price)} | Per Kg: {formatKES(rate.price_per_kg)}
                </div>
              </form>
            ))}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
