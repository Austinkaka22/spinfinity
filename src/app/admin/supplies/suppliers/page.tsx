import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import { createSupplierAction, updateSupplierAction } from "@/app/admin/actions";
import { fetchAdminSuppliers } from "@/app/admin/data";

export default async function AdminSuppliersPage() {
  const suppliers = await fetchAdminSuppliers();

  return (
    <div className="space-y-6">
      <AdminPageSection title="Create Supplier" description="Add supplier contacts for storage receipts and finance tracking.">
        <form action={createSupplierAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input name="company_name" required placeholder="Company name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="contact_name" placeholder="Contact name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="phone" placeholder="Phone" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="email" type="email" placeholder="Email" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button className="rounded-md bg-[var(--brand-primary)] px-4 py-2 text-sm font-medium text-white md:col-span-2 xl:col-span-4">Create Supplier</button>
        </form>
      </AdminPageSection>

      <AdminPageSection title="Suppliers" description="Manage active and inactive suppliers.">
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
                <th className="border-b border-slate-200 px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="odd:bg-white even:bg-slate-50/40 align-top">
                  <td className="border-b border-slate-100 px-3 py-2 font-medium text-slate-900">{supplier.company_name}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{supplier.contact_name ?? "-"}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{supplier.phone ?? "-"}</td>
                  <td className="border-b border-slate-100 px-3 py-2">{supplier.email ?? "-"}</td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${supplier.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                      {supplier.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">{new Date(supplier.created_at).toLocaleDateString()}</td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <form action={updateSupplierAction} className="grid gap-2 md:grid-cols-2">
                      <input type="hidden" name="id" value={supplier.id} />
                      <input name="company_name" defaultValue={supplier.company_name} className="rounded-md border border-slate-300 px-2 py-1" />
                      <input name="contact_name" defaultValue={supplier.contact_name ?? ""} className="rounded-md border border-slate-300 px-2 py-1" />
                      <input name="phone" defaultValue={supplier.phone ?? ""} className="rounded-md border border-slate-300 px-2 py-1" />
                      <input name="email" defaultValue={supplier.email ?? ""} className="rounded-md border border-slate-300 px-2 py-1" />
                      <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="is_active" defaultChecked={supplier.is_active} /> Active</label>
                      <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPageSection>
    </div>
  );
}
