"use client";

import { useState } from "react";
import type { Branch, StaffProfile } from "@/app/admin/data";

type StaffAction = (formData: FormData) => void | Promise<void>;

type StaffManagerProps = {
  branches: Branch[];
  profiles: StaffProfile[];
  emailByUserId: Record<string, string>;
  createAction: StaffAction;
  updateAction: StaffAction;
};

type StaffFormModalProps = {
  title: string;
  submitLabel: string;
  action: StaffAction;
  branches: Branch[];
  onClose: () => void;
  profile?: StaffProfile;
  email?: string;
};

function roleLabel(role: StaffProfile["role"]) {
  if (role === "admin") return "Admin";
  if (role === "driver") return "Driver";
  return "Staff";
}

function statusLabel(status: StaffProfile["status"]) {
  if (status === "inactive") return "Inactive";
  if (status === "terminated") return "Terminated";
  return "Active";
}

function StaffFormModal({
  title,
  submitLabel,
  action,
  branches,
  onClose,
  profile,
  email,
}: StaffFormModalProps) {
  const [role, setRole] = useState<StaffProfile["role"]>(profile?.role ?? "staff");

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
          {profile ? <input type="hidden" name="id" value={profile.id} /> : null}

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Full Name</span>
            <input
              name="full_name"
              defaultValue={profile?.full_name ?? ""}
              placeholder="Full name"
              required
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          {profile ? (
            <label className="grid gap-1 text-sm">
              <span className="text-slate-700">Email</span>
              <input
                value={email ?? ""}
                readOnly
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600"
              />
            </label>
          ) : (
            <label className="grid gap-1 text-sm">
              <span className="text-slate-700">Email</span>
              <input
                name="email"
                type="email"
                placeholder="Email address"
                required
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </label>
          )}

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Role</span>
            <select
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value as StaffProfile["role"])}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="driver">Driver</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Status</span>
            <select
              name="status"
              defaultValue={profile?.status ?? "active"}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
          </label>

          {role === "staff" ? (
            <label className="grid gap-1 text-sm md:col-span-2">
              <span className="text-slate-700">Branch</span>
              <select
                name="branch_id"
                defaultValue={profile?.branch_id ?? ""}
                required
                className="rounded-md border border-slate-300 px-3 py-2"
              >
                <option value="" disabled>
                  Select branch
                </option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <input type="hidden" name="branch_id" value="" />
          )}

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

export function StaffManager({
  branches,
  profiles,
  emailByUserId,
  createAction,
  updateAction,
}: StaffManagerProps) {
  const branchNameById = new Map(branches.map((branch) => [branch.id, branch.name]));
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<StaffProfile | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white"
        >
          Create Staff
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="border-b border-slate-200 px-3 py-2">Email</th>
              <th className="border-b border-slate-200 px-3 py-2">Full Name</th>
              <th className="border-b border-slate-200 px-3 py-2">Role</th>
              <th className="border-b border-slate-200 px-3 py-2">Branch</th>
              <th className="border-b border-slate-200 px-3 py-2">Status</th>
              <th className="border-b border-slate-200 px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                  No staff accounts found.
                </td>
              </tr>
            ) : (
              profiles.map((profile) => (
                <tr key={profile.id} className="odd:bg-white even:bg-slate-50/40">
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {emailByUserId[profile.id] || "-"}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {profile.full_name ?? "-"}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {roleLabel(profile.role)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {profile.role === "staff" && profile.branch_id
                      ? (branchNameById.get(profile.branch_id) ?? "-")
                      : "-"}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                    {statusLabel(profile.status)}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(profile)}
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
        <StaffFormModal
          title="Create Staff Account"
          submitLabel="Send Invite"
          action={createAction}
          branches={branches}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {editingProfile ? (
        <StaffFormModal
          title={`Update ${editingProfile.full_name ?? "Account"}`}
          submitLabel="Save Changes"
          action={updateAction}
          branches={branches}
          profile={editingProfile}
          email={emailByUserId[editingProfile.id] ?? ""}
          onClose={() => setEditingProfile(null)}
        />
      ) : null}
    </div>
  );
}
