import Link from "next/link";
import { InvoiceBuilder, type BuilderItem } from "@/components/invoice-builder";
import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth/guards";
import { createInvoiceAction } from "@/app/staff/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type StaffPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

type RecentOrder = {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const session = await requireRole("staff");
  const supabase = await createServerSupabaseClient();
  const params = (await searchParams) ?? {};
  const error = readParam(params.error);

  const [itemsRes, ratesRes, ordersRes] = await Promise.all([
    supabase.from("items").select("id,name").eq("is_active", true).order("name"),
    supabase
      .from("pricing_rates")
      .select(
        "id,item_id,pricing_model,unit_price,price_per_kg,pricing_category_id,pricing_categories(name)",
      )
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("id,invoice_number,customer_name,total_amount,status,created_at")
      .eq("branch_id", session.branchId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const items = (itemsRes.data ?? []) as BuilderItem[];
  type RawRate = {
    id: string;
    item_id: string;
    pricing_model: "itemized" | "weighted";
    unit_price: number | null;
    price_per_kg: number | null;
    pricing_categories?: { name: string } | Array<{ name: string }> | null;
  };

  const rates = ((ratesRes.data ?? []) as unknown as RawRate[]).map((rate) => {
    const categoryName = Array.isArray(rate.pricing_categories)
      ? (rate.pricing_categories[0]?.name ?? null)
      : (rate.pricing_categories?.name ?? null);

    return {
    id: rate.id,
    item_id: rate.item_id,
    pricing_model: rate.pricing_model,
    unit_price: rate.unit_price,
    price_per_kg: rate.price_per_kg,
    pricing_category_name: categoryName,
  };
  });
  const orders = (ordersRes.data ?? []) as RecentOrder[];

  return (
    <PortalShell
      role={session.role}
      branchId={session.branchId}
      title="Staff POS Portal"
      description="Hybrid invoice builder (itemized + weighted), totals, and receipt generation."
    >
      <div className="space-y-6">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </p>
        ) : null}
        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Create Invoice</h2>
          <form action={createInvoiceAction} className="mt-4 space-y-4">
            <div className="grid gap-2 md:grid-cols-4">
              <input
                name="customer_name"
                required
                placeholder="Customer name"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="customer_phone"
                placeholder="Customer phone"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="customer_email"
                type="email"
                placeholder="Customer email"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="discount_amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                placeholder="Discount (KES)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="notes"
              placeholder="Order notes"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={2}
            />
            <InvoiceBuilder items={items} rates={rates} />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Create Invoice
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
          <div className="mt-3 space-y-2">
            {orders.length === 0 ? (
              <p className="text-sm text-slate-600">No invoices yet for this branch.</p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-200 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {order.invoice_number} - {order.customer_name}
                    </p>
                    <p className="text-xs text-slate-600">
                      Status: {order.status} | Created: {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900">
                      KES {Number(order.total_amount).toFixed(2)}
                    </span>
                    <Link
                      href={`/staff/invoices/${order.id}`}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
