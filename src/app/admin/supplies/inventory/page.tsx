import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import {
  branchRestockAction,
  receiveToStorageAction,
  rejectBranchSupplyRequestAction,
  restockBranchDirectSupplyAction,
} from "@/app/admin/actions";
import { fetchAdminInventoryData } from "@/app/admin/data";

function supplyItemLabel(item: "dirtex" | "perchlo" | "laundry_bag" | "hanger") {
  if (item === "dirtex") return "Dirtex";
  if (item === "perchlo") return "Perchlo";
  if (item === "laundry_bag") return "Laundry Bag";
  return "Hanger";
}

export default async function AdminInventoryPage() {
  const { branches, hubBranches, branchLevels, storageLaundryBagLevel, storageHangerLevel, restockLogs, suppliers, branchRequests, storageByItem } =
    await fetchAdminInventoryData();

  return (
    <div className="space-y-6">
      <AdminPageSection title="Storage Levels" description="Storage stock is tracked for Laundry Bags and hangers.">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Laundry Bags In Storage</p><p className="mt-1 text-3xl font-semibold text-[var(--brand-primary-dark)]">{storageLaundryBagLevel}</p></article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-600">Hangers In Storage</p><p className="mt-1 text-3xl font-semibold text-[var(--brand-primary-dark)]">{storageHangerLevel}</p></article>
        </div>
      </AdminPageSection>

      <AdminPageSection title="Branch Requests: Hangers & Laundry Bags" description="Fulfill or reject stock requests created by branch staff.">
        <div className="space-y-3">
          {branchRequests.length === 0 ? <p className="text-sm text-slate-500">No pending branch requests.</p> : branchRequests.map((request) => (
            <div key={request.id} className="rounded-xl border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{request.branchName} • {supplyItemLabel(request.supply_item)}</p>
                  <p className="text-sm text-slate-600">Qty: {request.quantity} • Requested: {new Date(request.created_at).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">{request.status}</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <form action={branchRestockAction} className="rounded-lg border border-slate-200 p-3">
                  <input type="hidden" name="request_id" value={request.id} />
                  <input type="hidden" name="branch_id" value={request.branch_id} />
                  <input type="hidden" name="supply_item" value={request.supply_item} />
                  <label className="grid gap-1 text-sm"><span>Fulfill quantity (max storage: {storageByItem[request.supply_item]})</span><input name="quantity" type="number" min={1} max={storageByItem[request.supply_item]} defaultValue={request.quantity} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
                  <input name="note" placeholder="Fulfillment note" className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <button className="mt-2 rounded-md bg-[var(--brand-primary)] px-3 py-2 text-sm font-medium text-white">Fulfill</button>
                </form>
                <form action={rejectBranchSupplyRequestAction} className="rounded-lg border border-slate-200 p-3">
                  <input type="hidden" name="request_id" value={request.id} />
                  <label className="grid gap-1 text-sm"><span>Reject reason (optional)</span><input name="note" placeholder="Reason" className="rounded-md border border-slate-300 px-3 py-2" /></label>
                  <button className="mt-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </AdminPageSection>

      <AdminPageSection title="Stock Movements" description="Receive to storage and transfer stock to branches.">
        <div className="grid gap-4 xl:grid-cols-3">
          <form action={receiveToStorageAction} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-900">Receive to Storage</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm"><span>Supplier</span><select name="supplier_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.company_name}</option>)}</select></label>
              <label className="grid gap-1 text-sm"><span>Item</span><select name="supply_item" className="rounded-md border border-slate-300 px-3 py-2"><option value="laundry_bag">Laundry Bag</option><option value="hanger">Hanger</option></select></label>
              <label className="grid gap-1 text-sm"><span>Quantity</span><input name="quantity" type="number" min={1} step={1} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="grid gap-1 text-sm"><span>Unit cost (optional)</span><input name="unit_cost" type="number" min={0.01} step={0.01} className="rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="grid gap-1 text-sm"><span>Note (optional)</span><input name="note" className="rounded-md border border-slate-300 px-3 py-2" /></label>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Receive to Storage</button>
            </div>
          </form>

          <form action={branchRestockAction} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-900">Branch Restock</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm"><span>Branch</span><select name="branch_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select branch</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.code} - {branch.name}</option>)}</select></label>
              <label className="grid gap-1 text-sm"><span>Item</span><select name="supply_item" className="rounded-md border border-slate-300 px-3 py-2"><option value="laundry_bag">Laundry Bag</option><option value="hanger">Hanger</option></select></label>
              <label className="grid gap-1 text-sm"><span>Quantity</span><input name="quantity" type="number" min={1} step={1} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="grid gap-1 text-sm"><span>Note (optional)</span><input name="note" className="rounded-md border border-slate-300 px-3 py-2" /></label>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Restock Branch</button>
            </div>
          </form>

          <form action={restockBranchDirectSupplyAction} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-900">Direct Restock (Dirtex/Perchlo)</h3>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm"><span>Hub Branch</span><select name="branch_id" required className="rounded-md border border-slate-300 px-3 py-2"><option value="">Select hub branch</option>{hubBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.code} - {branch.name}</option>)}</select></label>
              <label className="grid gap-1 text-sm"><span>Item</span><select name="supply_item" className="rounded-md border border-slate-300 px-3 py-2"><option value="dirtex">Dirtex</option><option value="perchlo">Perchlo</option></select></label>
              <label className="grid gap-1 text-sm"><span>Quantity (Litres)</span><input name="quantity" type="number" min={0.1} step={0.1} required className="rounded-md border border-slate-300 px-3 py-2" /></label>
              <label className="grid gap-1 text-sm"><span>Note (optional)</span><input name="note" className="rounded-md border border-slate-300 px-3 py-2" /></label>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">Restock Branch</button>
            </div>
          </form>
        </div>
      </AdminPageSection>

      <AdminPageSection title="Current Branch Levels" description="Inventory visibility for tracked supplies at each branch.">
        <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full border-collapse text-left text-sm"><thead className="bg-slate-100 text-slate-700"><tr><th className="border-b border-slate-200 px-3 py-2">Branch</th><th className="border-b border-slate-200 px-3 py-2">Dirtex (L)</th><th className="border-b border-slate-200 px-3 py-2">Perchlo (L)</th><th className="border-b border-slate-200 px-3 py-2">Laundry Bags</th></tr></thead><tbody>{branchLevels.length===0?<tr><td colSpan={4} className="px-3 py-6 text-center text-slate-500">No branch supply levels found.</td></tr>:branchLevels.map((branch)=><tr key={branch.branchId} className="odd:bg-white even:bg-slate-50/40"><td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-900">{branch.branchCode} - {branch.branchName}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{branch.dirtex.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{branch.perchlo.toFixed(2)}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{branch.laundryBag}</td></tr>)}</tbody></table></div>
      </AdminPageSection>

      <AdminPageSection title="Recent Restock History" description="Audit trail for direct and storage restock operations.">
        <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full border-collapse text-left text-sm"><thead className="bg-slate-100 text-slate-700"><tr><th className="border-b border-slate-200 px-3 py-2">Time</th><th className="border-b border-slate-200 px-3 py-2">Branch</th><th className="border-b border-slate-200 px-3 py-2">Item</th><th className="border-b border-slate-200 px-3 py-2">Source</th><th className="border-b border-slate-200 px-3 py-2">Quantity</th><th className="border-b border-slate-200 px-3 py-2">Note</th></tr></thead><tbody>{restockLogs.length===0?<tr><td colSpan={6} className="px-3 py-6 text-center text-slate-500">No restock history yet.</td></tr>:restockLogs.map((log)=><tr key={log.id} className="odd:bg-white even:bg-slate-50/40"><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{new Date(log.created_at).toLocaleString()}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.branchName}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{supplyItemLabel(log.supply_item)}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.source_type === "storage" ? "Storage" : "Direct"}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.quantity == null ? "-" : log.supply_item === "dirtex" || log.supply_item === "perchlo" ? `${log.quantity} L` : log.quantity}</td><td className="border-b border-slate-100 px-3 py-2 text-slate-700">{log.note ?? "-"}</td></tr>)}</tbody></table></div>
      </AdminPageSection>
    </div>
  );
}
