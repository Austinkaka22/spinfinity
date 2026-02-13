"use client";

import { type ReactNode, useState } from "react";
import type { BranchSupplyRequest, Supplier } from "@/app/admin/data";

type BranchOption = { id: string; code: string; name: string; branch_type: string };
type RestockLog = {
  id: string;
  branch_id: string;
  branchName: string;
  supply_item: "dirtex" | "perchlo" | "laundry_bag" | "hanger";
  quantity: number | null;
  source_type: "direct" | "storage";
  note: string | null;
  created_at: string;
};

type Props = {
  branches: BranchOption[];
  branchLevels: Array<{ branchId: string; branchCode: string; branchName: string; dirtex: number; perchlo: number; laundryBag: number }>;
  suppliers: Supplier[];
  branchRequests: BranchSupplyRequest[];
  storageByItem: { laundry_bag: number; hanger: number };
  storageLaundryBagLevel: number;
  storageHangerLevel: number;
  restockLogs: RestockLog[];
  receiveToStorageAction: (formData: FormData) => void | Promise<void>;
  receiveToBranchAction: (formData: FormData) => void | Promise<void>;
  branchRestockAction: (formData: FormData) => void | Promise<void>;
  rejectBranchSupplyRequestAction: (formData: FormData) => void | Promise<void>;
};

function supplyItemLabel(item: "dirtex" | "perchlo" | "laundry_bag" | "hanger") {
  if (item === "dirtex") return "Dirtex";
  if (item === "perchlo") return "Perchlo";
  if (item === "laundry_bag") return "Laundry Bag";
  return "Hanger";
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-md border border-slate-300 px-3 py-1 text-sm">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function InventoryManagement(props: Props) {
  const [openModal, setOpenModal] = useState<"storage" | "branch" | null>(null);
  const [transferRequest, setTransferRequest] = useState<BranchSupplyRequest | null>(null);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Storage Levels</h2>
        <p className="text-sm text-slate-600">Storage stock is tracked for Laundry Bags and hangers.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Laundry Bags In Storage</p><p className="mt-1 text-3xl font-semibold text-[var(--brand-primary-dark)]">{props.storageLaundryBagLevel}</p></article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Hangers In Storage</p><p className="mt-1 text-3xl font-semibold text-[var(--brand-primary-dark)]">{props.storageHangerLevel}</p></article>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Branch Requests: Hangers & Laundry Bags</h2>
        <p className="text-sm text-slate-600">Transfer stock from storage for pending requests.</p>
        <div className="mt-4 space-y-3">
          {props.branchRequests.length === 0 ? <p className="text-sm text-slate-500">No pending branch requests.</p> : props.branchRequests.map((request) => (
            <div key={request.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{request.branchName} • {supplyItemLabel(request.supply_item)}</p>
                  <p className="text-sm text-slate-600">Qty: {request.quantity} • Requested: {new Date(request.created_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">{request.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setTransferRequest(request)} className="rounded-md bg-[var(--brand-primary)] px-3 py-2 text-sm font-medium text-white">Transfer from Storage</button>
                <form action={props.rejectBranchSupplyRequestAction}>
                  <input type="hidden" name="request_id" value={request.id} />
                  <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Stock Movements</h2>
        <p className="text-sm text-slate-600">Receive inventory into storage or directly to branches.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={() => setOpenModal("storage")} className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Receive to Storage</button>
          <button type="button" onClick={() => setOpenModal("branch")} className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Receive to Branch</button>
        </div>
      </section>

      {openModal === "storage" ? (
        <Modal title="Receive to Storage" onClose={() => setOpenModal(null)}>
          <form action={props.receiveToStorageAction} className="grid gap-3">
            <label className="grid gap-1 text-sm"><span>Supplier</span><select name="supplier_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select supplier</option>{props.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>)}</select></label>
            <label className="grid gap-1 text-sm"><span>Item</span><select name="supply_item" required className="rounded-md border border-slate-300 px-3 py-2"><option value="laundry_bag">Laundry Bag</option><option value="hanger">Hanger</option></select></label>
            <label className="grid gap-1 text-sm"><span>Quantity</span><input name="quantity" type="number" min={1} step={1} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
            <label className="grid gap-1 text-sm"><span>Total cost</span><input name="total_cost" type="number" min={0.01} step={0.01} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
            <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Submit</button>
          </form>
        </Modal>
      ) : null}

      {openModal === "branch" ? (
        <Modal title="Receive to Branch" onClose={() => setOpenModal(null)}>
          <form action={props.receiveToBranchAction} className="grid gap-3">
            <label className="grid gap-1 text-sm"><span>Branch</span><select name="branch_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select branch</option>{props.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.code} - {branch.name}</option>)}</select></label>
            <label className="grid gap-1 text-sm"><span>Supplier</span><select name="supplier_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select supplier</option>{props.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>)}</select></label>
            <label className="grid gap-1 text-sm"><span>Item</span><select name="supply_item" required className="rounded-md border border-slate-300 px-3 py-2"><option value="dirtex">Dirtex</option><option value="perchlo">Perchlo</option></select></label>
            <label className="grid gap-1 text-sm"><span>Quantity (Litres)</span><input name="quantity" type="number" min={0.01} step={0.01} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
            <label className="grid gap-1 text-sm"><span>Total cost</span><input name="total_cost" type="number" min={0.01} step={0.01} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
            <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Submit</button>
          </form>
        </Modal>
      ) : null}

      {transferRequest ? (
        <Modal title="Transfer from Storage" onClose={() => setTransferRequest(null)}>
          <form action={props.branchRestockAction} className="grid gap-3">
            <input type="hidden" name="request_id" value={transferRequest.id} />
            <input type="hidden" name="branch_id" value={transferRequest.branch_id} />
            <input type="hidden" name="supply_item" value={transferRequest.supply_item} />
            <label className="grid gap-1 text-sm"><span>Branch</span><input value={transferRequest.branchName} readOnly className="rounded-md border border-slate-300 px-3 py-2 bg-slate-50" /></label>
            <label className="grid gap-1 text-sm"><span>Item</span><input value={supplyItemLabel(transferRequest.supply_item)} readOnly className="rounded-md border border-slate-300 px-3 py-2 bg-slate-50" /></label>
            <label className="grid gap-1 text-sm"><span>Transfer quantity (max storage: {props.storageByItem[transferRequest.supply_item]})</span><input name="quantity" type="number" min={1} max={props.storageByItem[transferRequest.supply_item]} step={1} defaultValue={transferRequest.quantity} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
            <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Confirm transfer</button>
          </form>
        </Modal>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Current Branch Levels</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full border-collapse text-left text-sm"><thead className="bg-slate-100 text-slate-700"><tr><th className="border-b border-slate-200 px-3 py-2">Branch</th><th className="border-b border-slate-200 px-3 py-2">Dirtex (L)</th><th className="border-b border-slate-200 px-3 py-2">Perchlo (L)</th><th className="border-b border-slate-200 px-3 py-2">Laundry Bags</th></tr></thead><tbody>{props.branchLevels.length===0?<tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">No branch supply levels found.</td></tr>:props.branchLevels.map((branch)=><tr key={branch.branchId} className="odd:bg-white even:bg-slate-50/40"><td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-900">{branch.branchCode} - {branch.branchName}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{branch.dirtex.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{branch.perchlo.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{branch.laundryBag}</td></tr>)}</tbody></table></div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Restock History</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full border-collapse text-left text-sm"><thead className="bg-slate-100 text-slate-700"><tr><th className="border-b border-slate-200 px-3 py-2">Time</th><th className="border-b border-slate-200 px-3 py-2">Branch</th><th className="border-b border-slate-200 px-3 py-2">Item</th><th className="border-b border-slate-200 px-3 py-2">Source</th><th className="border-b border-slate-200 px-3 py-2">Quantity</th><th className="border-b border-slate-200 px-3 py-2">Note</th></tr></thead><tbody>{props.restockLogs.length===0?<tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">No restock history yet.</td></tr>:props.restockLogs.map((log)=><tr key={log.id} className="odd:bg-white even:bg-slate-50/40"><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{new Date(log.created_at).toLocaleString()}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.branchName}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{supplyItemLabel(log.supply_item)}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.source_type === "storage" ? "Storage" : "Direct"}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.quantity == null ? "-" : log.supply_item === "dirtex" || log.supply_item === "perchlo" ? `${log.quantity} L` : log.quantity}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.note ?? "-"}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
