"use client";

import { useState } from "react";
import type { Branch } from "@/app/admin/data";

type BranchAction = (formData: FormData) => void | Promise<void>;

type BranchManagerProps = {
  branches: Branch[];
  createAction: BranchAction;
  updateAction: BranchAction;
};

type BranchFormModalProps = {
  title: string;
  submitLabel: string;
  action: BranchAction;
  onClose: () => void;
  branch?: Branch;
};

function statusLabel(status: Branch["status"]) {
  if (status === "inactive") return "Inactive";
  if (status === "closed") return "Closed";
  return "Active";
}

function BranchFormModal({
  title,
  submitLabel,
  action,
  onClose,
  branch,
}: BranchFormModalProps) {
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
          {branch ? <input type="hidden" name="id" value={branch.id} /> : null}

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Code</span>
            <input
              name="code"
              defaultValue={branch?.code ?? ""}
              placeholder="BUR"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Branch Name</span>
            <input
              name="name"
              defaultValue={branch?.name ?? ""}
              placeholder="Branch name"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Branch Type</span>
            <select
              name="branch_type"
              defaultValue={branch?.branch_type ?? "hub"}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="hub">Hub</option>
              <option value="satellite">Satellite</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Status</span>
            <select
              name="status"
              defaultValue={branch?.status ?? "active"}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-slate-700">Phone Number</span>
            <input
              name="phone_number"
              defaultValue={branch?.phone_number ?? ""}
              placeholder="+254700000000"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="md:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BranchManager({ branches, createAction, updateAction }: BranchManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Create Branch
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="border-b border-slate-200 px-3 py-2">Code</th>
              <th className="border-b border-slate-200 px-3 py-2">Name</th>
              <th className="border-b border-slate-200 px-3 py-2">Type</th>
              <th className="border-b border-slate-200 px-3 py-2">Status</th>
              <th className="border-b border-slate-200 px-3 py-2">Phone Number</th>
              <th className="border-b border-slate-200 px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                  No branches found.
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr key={branch.id} className="odd:bg-white even:bg-slate-50/40">
                  <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-900">
                    {branch.code}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {branch.name}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {branch.branch_type === "hub" ? "Hub" : "Satellite"}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {statusLabel(branch.status)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {branch.phone_number ?? "-"}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingBranch(branch)}
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
        <BranchFormModal
          title="Create Branch"
          submitLabel="Create Branch"
          action={createAction}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingBranch ? (
        <BranchFormModal
          title={`Update ${editingBranch.name}`}
          submitLabel="Save Changes"
          action={updateAction}
          branch={editingBranch}
          onClose={() => setEditingBranch(null)}
        />
      ) : null}
    </div>
  );
}
