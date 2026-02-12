import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type CustomerRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
};

export default async function AdminCustomersPage() {
  const supabase = createSupabaseAdminClient();
  const [customersRes, ordersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email,phone,address,is_active")
      .eq("role", "customer")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("customer_id")
      .not("customer_id", "is", null),
  ]);

  const customers = (customersRes.data ?? []) as CustomerRow[];
  const orders = (ordersRes.data ?? []) as Array<{ customer_id: string | null }>;
  const orderCountByCustomer = new Map<string, number>();

  orders.forEach((row) => {
    if (!row.customer_id) return;
    const current = orderCountByCustomer.get(row.customer_id) ?? 0;
    orderCountByCustomer.set(row.customer_id, current + 1);
  });

  return (
    <AdminPageSection
      title="Customers"
      description="View registered customer accounts and account-level contact details."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Phone</th>
              <th className="px-3 py-2">Address</th>
              <th className="px-3 py-2">Orders</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{customer.full_name ?? "-"}</td>
                <td className="px-3 py-2">{customer.email ?? "-"}</td>
                <td className="px-3 py-2">{customer.phone ?? "-"}</td>
                <td className="px-3 py-2">{customer.address ?? "-"}</td>
                <td className="px-3 py-2">{orderCountByCustomer.get(customer.id) ?? 0}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      customer.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {customer.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {customers.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No registered customers found.</p>
      ) : null}
    </AdminPageSection>
  );
}
