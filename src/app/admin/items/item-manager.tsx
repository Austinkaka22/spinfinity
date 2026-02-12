"use client";

import { useState } from "react";
import type { Item } from "@/app/admin/data";

type ItemAction = (formData: FormData) => void | Promise<void>;

type ItemManagerProps = {
  items: Item[];
  createAction: ItemAction;
  updateAction: ItemAction;
  deleteAction: ItemAction;
};

type ItemFormModalProps = {
  title: string;
  submitLabel: string;
  action: ItemAction;
  onClose: () => void;
  item?: Item;
  deleteAction?: ItemAction;
};

function ItemFormModal({
  title,
  submitLabel,
  action,
  onClose,
  item,
  deleteAction,
}: ItemFormModalProps) {
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
          {item ? <input type="hidden" name="id" value={item.id} /> : null}

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Item Name</span>
            <input
              name="name"
              defaultValue={item?.name ?? ""}
              placeholder="Item name"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Status</span>
            <select
              name="status"
              defaultValue={item?.status ?? "active"}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-slate-700">Description</span>
            <input
              name="description"
              defaultValue={item?.description ?? ""}
              placeholder="Description"
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="md:col-span-2 flex justify-between gap-2">
            <div>
              {item && deleteAction ? (
                <button
                  formAction={handleDelete}
                  className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700"
                >
                  Delete Item
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

export function ItemManager({ items, createAction, updateAction, deleteAction }: ItemManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Create Item
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="border-b border-slate-200 px-3 py-2">Item</th>
              <th className="border-b border-slate-200 px-3 py-2">Description</th>
              <th className="border-b border-slate-200 px-3 py-2">Status</th>
              <th className="border-b border-slate-200 px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  No items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="odd:bg-white even:bg-slate-50/40">
                  <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {item.description ?? "-"}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {item.status === "active" ? "Active" : "Inactive"}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
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

      {isCreateOpen ? (
        <ItemFormModal
          title="Create Item"
          submitLabel="Create Item"
          action={createAction}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingItem ? (
        <ItemFormModal
          title={`Update ${editingItem.name}`}
          submitLabel="Save Changes"
          action={updateAction}
          deleteAction={deleteAction}
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      ) : null}
    </div>
  );
}
