import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function AdminReportsPage() {
  const supabase = createSupabaseAdminClient();
  const [ordersRes, pickupRes, activeOrdersRes] = await Promise.all([
    supabase.from("orders").select("total_amount"),
    supabase.from("pickup_requests").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .not("status", "in", "(completed,closed)"),
  ]);

  const orders = ordersRes.data ?? [];
  const totalRevenue = orders.reduce(
    (sum, row) => sum + Number(row.total_amount ?? 0),
    0,
  );

  const cards = [
    { label: "Total Invoices", value: String(orders.length) },
    { label: "Total Revenue", value: `KES ${totalRevenue.toFixed(2)}` },
    { label: "Open Orders", value: String(activeOrdersRes.count ?? 0) },
    { label: "Pickup Requests", value: String(pickupRes.count ?? 0) },
  ];

  return (
    <AdminPageSection
      title="Reports"
      description="Summary metrics for operations and financial visibility."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[var(--brand-line)] bg-[var(--brand-bg)] p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[var(--brand-primary-dark)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-slate-600">
        This page is the starting scaffold for deeper reports (channel reconciliation,
        branch performance, exports) in later milestones.
      </p>
    </AdminPageSection>
  );
}
