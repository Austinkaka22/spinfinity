"use client";

import { useState } from "react";
import type {
  Item,
  PricingCategory,
  PricingRate,
  WeightPricingTier,
} from "@/app/admin/data";

type PricingAction = (formData: FormData) => void | Promise<void>;

type PricingManagerProps = {
  items: Item[];
  categories: PricingCategory[];
  rates: PricingRate[];
  weightPricingTiers: WeightPricingTier[];
  createRateAction: PricingAction;
  updateRateAction: PricingAction;
  deleteRateAction: PricingAction;
  createTierAction: PricingAction;
  updateTierAction: PricingAction;
  deleteTierAction: PricingAction;
};

type RateModalProps = {
  title: string;
  submitLabel: string;
  items: Item[];
  categories: PricingCategory[];
  action: PricingAction;
  onClose: () => void;
  rate?: PricingRate;
  deleteAction?: PricingAction;
};

type TierModalProps = {
  title: string;
  submitLabel: string;
  action: PricingAction;
  onClose: () => void;
  tier?: WeightPricingTier;
  deleteAction?: PricingAction;
};

function RateModal({
  title,
  submitLabel,
  items,
  categories,
  action,
  onClose,
  rate,
  deleteAction,
}: RateModalProps) {
  async function handleSubmit(formData: FormData) {
    await action(formData);
    onClose();
  }

  async function handleDelete(formData: FormData) {
    if (!deleteAction) return;
    await deleteAction(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
          >
            Close
          </button>
        </div>

        <form action={handleSubmit} className="grid gap-3 md:grid-cols-2">
          {rate ? <input type="hidden" name="id" value={rate.id} /> : null}
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Item</span>
            <select
              name="item_id"
              defaultValue={rate?.item_id ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
              required
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
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Category</span>
            <select
              name="pricing_category_id"
              defaultValue={rate?.pricing_category_id ?? ""}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Unit Price (KES)</span>
            <input
              name="unit_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={rate?.unit_price ?? ""}
              placeholder="0.00"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm mt-6">
            <input type="checkbox" name="is_active" defaultChecked={rate?.is_active ?? true} />
            Active
          </label>
          <div className="md:col-span-2 flex justify-between gap-2">
            <div>
              {rate && deleteAction ? (
                <button
                  formAction={handleDelete}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700"
                >
                  Delete Rate
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function TierModal({ title, submitLabel, action, onClose, tier, deleteAction }: TierModalProps) {
  async function handleSubmit(formData: FormData) {
    await action(formData);
    onClose();
  }

  async function handleDelete(formData: FormData) {
    if (!deleteAction) return;
    await deleteAction(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
          >
            Close
          </button>
        </div>

        <form action={handleSubmit} className="grid gap-3 md:grid-cols-3">
          {tier ? <input type="hidden" name="id" value={tier.id} /> : null}
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Min Kg</span>
            <input
              name="min_kg"
              type="number"
              step="0.001"
              min="0.001"
              defaultValue={tier?.min_kg ?? ""}
              placeholder="0.001"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Max Kg</span>
            <input
              name="max_kg"
              type="number"
              step="0.001"
              min="0.001"
              defaultValue={tier?.max_kg ?? ""}
              placeholder="5.000"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Price / Kg (KES)</span>
            <input
              name="price_per_kg"
              type="number"
              step="0.01"
              min="0"
              defaultValue={tier?.price_per_kg ?? ""}
              placeholder="0.00"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="md:col-span-3 flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={tier?.is_active ?? true} />
            Active
          </label>
          <div className="md:col-span-3 flex justify-between gap-2">
            <div>
              {tier && deleteAction ? (
                <button
                  formAction={handleDelete}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700"
                >
                  Delete Tier
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatKES(value: number | null) {
  if (value === null) return "-";
  return `KES ${Number(value).toFixed(2)}`;
}

export function PricingManager({
  items,
  categories,
  rates,
  weightPricingTiers,
  createRateAction,
  updateRateAction,
  deleteRateAction,
  createTierAction,
  updateTierAction,
  deleteTierAction,
}: PricingManagerProps) {
  const itemById = new Map(items.map((item) => [item.id, item.name]));
  const categoryById = new Map(categories.map((category) => [category.id, category.name]));
  const itemizedRates = rates.filter((rate) => rate.pricing_model === "itemized");
  const [isCreateRateOpen, setIsCreateRateOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<PricingRate | null>(null);
  const [isCreateTierOpen, setIsCreateTierOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<WeightPricingTier | null>(null);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-base font-semibold text-slate-900">Pricing Rates (Itemized)</h3>
          <button
            type="button"
            onClick={() => setIsCreateRateOpen(true)}
            className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            Create Rate
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2">Item</th>
                <th className="border-b border-slate-200 px-3 py-2">Category</th>
                <th className="border-b border-slate-200 px-3 py-2">Unit Price</th>
                <th className="border-b border-slate-200 px-3 py-2">Status</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {itemizedRates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    No pricing rates found.
                  </td>
                </tr>
              ) : (
                itemizedRates.map((rate) => (
                  <tr key={rate.id} className="odd:bg-white even:bg-slate-50/40">
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {itemById.get(rate.item_id) ?? rate.item_id}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {rate.pricing_category_id
                        ? (categoryById.get(rate.pricing_category_id) ?? "-")
                        : "-"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {formatKES(rate.unit_price)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {rate.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingRate(rate)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-base font-semibold text-slate-900">Weight Pricing Tiers</h3>
          <button
            type="button"
            onClick={() => setIsCreateTierOpen(true)}
            className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            Create Tier
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2">Kg Range</th>
                <th className="border-b border-slate-200 px-3 py-2">Price / Kg</th>
                <th className="border-b border-slate-200 px-3 py-2">Status</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {weightPricingTiers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                    No weight tiers found.
                  </td>
                </tr>
              ) : (
                weightPricingTiers.map((tier) => (
                  <tr key={tier.id} className="odd:bg-white even:bg-slate-50/40">
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {Number(tier.min_kg).toFixed(3)} - {Number(tier.max_kg).toFixed(3)} kg
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      KES {Number(tier.price_per_kg).toFixed(2)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {tier.is_active ? "Active" : "Inactive"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingTier(tier)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isCreateRateOpen ? (
        <RateModal
          title="Create Pricing Rate"
          submitLabel="Create Rate"
          items={items}
          categories={categories}
          action={createRateAction}
          onClose={() => setIsCreateRateOpen(false)}
        />
      ) : null}

      {editingRate ? (
        <RateModal
          title="Update Pricing Rate"
          submitLabel="Save Changes"
          items={items}
          categories={categories}
          action={updateRateAction}
          deleteAction={deleteRateAction}
          rate={editingRate}
          onClose={() => setEditingRate(null)}
        />
      ) : null}

      {isCreateTierOpen ? (
        <TierModal
          title="Create Weight Tier"
          submitLabel="Create Tier"
          action={createTierAction}
          onClose={() => setIsCreateTierOpen(false)}
        />
      ) : null}

      {editingTier ? (
        <TierModal
          title="Update Weight Tier"
          submitLabel="Save Changes"
          action={updateTierAction}
          deleteAction={deleteTierAction}
          tier={editingTier}
          onClose={() => setEditingTier(null)}
        />
      ) : null}
    </div>
  );
}
