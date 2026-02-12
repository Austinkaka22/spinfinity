import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import {
  receiveStorageSupplyAction,
  restockBranchDirectSupplyAction,
  restockBranchFromStorageAction,
} from "@/app/admin/actions";
import { fetchAdminInventoryData } from "@/app/admin/data";

function supplyItemLabel(item: "dirtex" | "perchlo" | "laundry_bag" | "hanger") {
  if (item === "dirtex") return "Dirtex";
  if (item === "perchlo") return "Perchlo";
  if (item === "laundry_bag") return "Laundry Bag";
  return "Hanger";
}

export default async function AdminInventoryPage() {
  const {
    branches,
    hubBranches,
    branchLevels,
    storageLaundryBagLevel,
    storageHangerLevel,
    restockLogs,
  } =
    await fetchAdminInventoryData();

  return (
    <div className="space-y-6">
      <AdminPageSection
        title="Storage Levels"
        description="Storage stock is tracked for Laundry Bags and hangers."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Laundry Bags In Storage</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--brand-primary-dark)]">
              {storageLaundryBagLevel}
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Hangers In Storage</p>
            <p className="mt-1 text-3xl font-semibold text-[var(--brand-primary-dark)]">
              {storageHangerLevel}
            </p>
          </article>
        </div>
      </AdminPageSection>

      <AdminPageSection
        title="Stock Movements"
        description="Laundry Bags and hangers move through storage in batches of 50. Dirtex and Perchlo are restocked directly to hubs in litres."
      >
        <div className="grid gap-4 xl:grid-cols-3">
          <form action={receiveStorageSupplyAction} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-900">Receive to Storage</h3>
            <p className="mt-1 text-sm text-slate-600">
              Receive Laundry Bags or hangers into storage. Use batches of 50.
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>Item</span>
                <select name="supply_item" className="rounded-md border border-slate-300 px-3 py-2">
                  <option value="laundry_bag">Laundry Bag</option>
                  <option value="hanger">Hanger</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>Quantity</span>
                <input
                  name="quantity"
                  type="number"
                  min={50}
                  step={50}
                  required
                  placeholder="50, 100, 150..."
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Note (optional)</span>
                <input
                  name="note"
                  placeholder="Supplier ref / batch"
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">
                Add to Storage
              </button>
            </div>
          </form>

          <form action={restockBranchFromStorageAction} className="rounded-xl border border-slate-200 p-4">
            <input type="hidden" name="source" value="storage" />
            <h3 className="text-base font-semibold text-slate-900">Restock From Storage</h3>
            <p className="mt-1 text-sm text-slate-600">
              Send Laundry Bags or hangers from storage to branches in batches of 50.
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>Branch</span>
                <select name="branch_id" required className="rounded-md border border-slate-300 px-3 py-2">
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.code} - {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>Item</span>
                <select name="supply_item" className="rounded-md border border-slate-300 px-3 py-2">
                  <option value="laundry_bag">Laundry Bag</option>
                  <option value="hanger">Hanger (not tracked)</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>Quantity</span>
                <input
                  name="quantity"
                  type="number"
                  min={50}
                  step={50}
                  required
                  placeholder="50, 100, 150..."
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Note (optional)</span>
                <input
                  name="note"
                  placeholder="Batch or driver note"
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">
                Restock Branch
              </button>
            </div>
          </form>

          <form action={restockBranchDirectSupplyAction} className="rounded-xl border border-slate-200 p-4">
            <h3 className="text-base font-semibold text-slate-900">Direct Branch Restock</h3>
            <p className="mt-1 text-sm text-slate-600">
              Dirtex and Perchlo are tracked in litres and can only be restocked to hub branches.
            </p>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm">
                <span>Hub Branch</span>
                <select name="branch_id" required className="rounded-md border border-slate-300 px-3 py-2">
                  <option value="">Select hub branch</option>
                  {hubBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.code} - {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>Item</span>
                <select name="supply_item" className="rounded-md border border-slate-300 px-3 py-2">
                  <option value="dirtex">Dirtex</option>
                  <option value="perchlo">Perchlo</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm">
                <span>Quantity (Litres)</span>
                <input
                  name="quantity"
                  type="number"
                  min={0.1}
                  step={0.1}
                  required
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>Note (optional)</span>
                <input
                  name="note"
                  placeholder="Supplier ref / batch"
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
              <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white">
                Restock Branch
              </button>
            </div>
          </form>
        </div>
      </AdminPageSection>

      <AdminPageSection
        title="Current Branch Levels"
        description="Inventory visibility for tracked supplies at each branch."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2">Branch</th>
                <th className="border-b border-slate-200 px-3 py-2">Dirtex (L)</th>
                <th className="border-b border-slate-200 px-3 py-2">Perchlo (L)</th>
                <th className="border-b border-slate-200 px-3 py-2">Laundry Bags</th>
              </tr>
            </thead>
            <tbody>
              {branchLevels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                    No branch supply levels found.
                  </td>
                </tr>
              ) : (
                branchLevels.map((branch) => (
                  <tr key={branch.branchId} className="odd:bg-white even:bg-slate-50/40">
                    <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-900">
                      {branch.branchCode} - {branch.branchName}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {branch.dirtex.toFixed(2)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {branch.perchlo.toFixed(2)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {branch.laundryBag}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPageSection>

      <AdminPageSection
        title="Recent Restock History"
        description="Audit trail for direct and storage restock operations."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="border-b border-slate-200 px-3 py-2">Time</th>
                <th className="border-b border-slate-200 px-3 py-2">Branch</th>
                <th className="border-b border-slate-200 px-3 py-2">Item</th>
                <th className="border-b border-slate-200 px-3 py-2">Source</th>
                <th className="border-b border-slate-200 px-3 py-2">Quantity</th>
                <th className="border-b border-slate-200 px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {restockLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No restock history yet.
                  </td>
                </tr>
              ) : (
                restockLogs.map((log) => (
                  <tr key={log.id} className="odd:bg-white even:bg-slate-50/40">
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {log.branchName}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {supplyItemLabel(log.supply_item)}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {log.source_type === "storage" ? "Storage" : "Direct"}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {log.quantity == null
                        ? "-"
                        : log.supply_item === "dirtex" || log.supply_item === "perchlo"
                          ? `${log.quantity} L`
                          : log.quantity}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-700">
                      {log.note ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminPageSection>
    </div>
  );
}
