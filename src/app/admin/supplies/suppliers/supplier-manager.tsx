"use client";

import { useMemo, useState } from "react";
import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import type { Supplier, SupplierReceipt } from "@/app/admin/data";

type SupplierAction = (formData: FormData) => void | Promise<void>;

type SupplierManagerProps = {
  suppliers: Supplier[];
  receipts: SupplierReceipt[];
  createAction: SupplierAction;
  updateAction: SupplierAction;
};

type SupplierFormModalProps = {
  title: string;
  submitLabel: string;
  action: SupplierAction;
  onClose: () => void;
  supplier?: Supplier;
};

type SupplierLedgerModalProps = {
  supplier: Supplier;
  receipts: SupplierReceipt[];
  onClose: () => void;
};

function supplyItemLabel(item: SupplierReceipt["supply_item"]) {
  if (item === "dirtex") return "Dirtex";
  if (item === "perchlo") return "Perchlo";
  if (item === "laundry_bag") return "Laundry Bag";
  return "Hanger";
}

function formatMoney(amount: number | null) {
  if (amount == null) return "-";
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SupplierFormModal({
  title,
  submitLabel,
  action,
  onClose,
  supplier,
}: SupplierFormModalProps) {
  async function handleSubmit(formData: FormData) {
    await action(formData);
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
          {supplier ? <input type="hidden" name="id" value={supplier.id} /> : null}

          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-slate-700">Company Name</span>
            <input
              name="company_name"
              defaultValue={supplier?.company_name ?? ""}
              placeholder="Company name"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Contact Name</span>
            <input
              name="contact_name"
              defaultValue={supplier?.contact_name ?? ""}
              placeholder="Contact name"
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Phone</span>
            <input
              name="phone"
              defaultValue={supplier?.phone ?? ""}
              placeholder="Phone"
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={supplier?.email ?? ""}
              placeholder="Email"
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          {supplier ? (
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" name="is_active" defaultChecked={supplier.is_active} />
              <span className="text-slate-700">Active</span>
            </label>
          ) : null}

          <div className="md:col-span-2 flex justify-end gap-2">
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
        </form>
      </div>
    </div>
  );
}

function SupplierLedgerModal({ supplier, receipts, onClose }: SupplierLedgerModalProps) {
  const totalQuantity = receipts.reduce((sum, receipt) => sum + Number(receipt.quantity), 0);
  const totalCost = receipts.reduce((sum, receipt) => sum + Number(receipt.total_cost ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-5xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{supplier.company_name} Ledger</h3>
            <p className="text-sm text-slate-600">Batches received into storage from this supplier.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Batches</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{receipts.length}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Quantity</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{totalQuantity}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total Cost</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{formatMoney(totalCost)}</p>
          </article>
        </div>

        <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2">Date</th>
                <th className="border-b border-slate-200 px-3 py-2">Item</th>
                <th className="border-b border-slate-200 px-3 py-2">Quantity</th>
                <th className="border-b border-slate-200 px-3 py-2">Unit Cost</th>
                <th className="border-b border-slate-200 px-3 py-2">Total Cost</th>
                <th className="border-b border-slate-200 px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No supply batches received from this supplier yet.
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.id} className="odd:bg-white even:bg-slate-50/40">
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {new Date(receipt.created_at).toLocaleString()}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {supplyItemLabel(receipt.supply_item)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {receipt.quantity}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {formatMoney(receipt.unit_cost)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {formatMoney(receipt.total_cost)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {receipt.note ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function SupplierManager({ suppliers, receipts, createAction, updateAction }: SupplierManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [ledgerSupplier, setLedgerSupplier] = useState<Supplier | null>(null);

  const receiptsBySupplier = useMemo(() => {
    const grouped = new Map<string, SupplierReceipt[]>();
    for (const receipt of receipts) {
      const current = grouped.get(receipt.supplier_id);
      if (current) {
        current.push(receipt);
      } else {
        grouped.set(receipt.supplier_id, [receipt]);
      }
    }
    return grouped;
  }, [receipts]);

  return (
    <div className="space-y-6">
      <AdminPageSection title="Suppliers" description="Manage active and inactive suppliers.">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white"
          >
            Create Supplier
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2">Company</th>
                <th className="border-b border-slate-200 px-3 py-2">Contact</th>
                <th className="border-b border-slate-200 px-3 py-2">Phone</th>
                <th className="border-b border-slate-200 px-3 py-2">Email</th>
                <th className="border-b border-slate-200 px-3 py-2">Status</th>
                <th className="border-b border-slate-200 px-3 py-2">Created</th>
                <th className="border-b border-slate-200 px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="odd:bg-white even:bg-slate-50/40">
                    <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-900">
                      {supplier.company_name}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {supplier.contact_name ?? "-"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {supplier.phone ?? "-"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {supplier.email ?? "-"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          supplier.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {supplier.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {new Date(supplier.created_at).toLocaleDateString()}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSupplier(supplier)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setLedgerSupplier(supplier)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                        >
                          Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPageSection>

      {isCreateOpen ? (
        <SupplierFormModal
          title="Create Supplier"
          submitLabel="Create Supplier"
          action={createAction}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingSupplier ? (
        <SupplierFormModal
          title={`Update ${editingSupplier.company_name}`}
          submitLabel="Save Changes"
          action={updateAction}
          supplier={editingSupplier}
          onClose={() => setEditingSupplier(null)}
        />
      ) : null}

      {ledgerSupplier ? (
        <SupplierLedgerModal
          supplier={ledgerSupplier}
          receipts={receiptsBySupplier.get(ledgerSupplier.id) ?? []}
          onClose={() => setLedgerSupplier(null)}
        />
      ) : null}
    </div>
  );
}
