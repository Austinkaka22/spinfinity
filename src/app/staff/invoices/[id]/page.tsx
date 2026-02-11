import Link from "next/link";
import { notFound } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InvoiceDetailPageProps = {
  params: Promise<{ id: string }>;
};

type OrderRow = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  notes: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
};

type OrderLineRow = {
  id: string;
  line_type: "itemized" | "weighted";
  quantity: number | null;
  weight_kg: number | null;
  unit_price: number | null;
  price_per_kg: number | null;
  line_total: number;
  items: { name: string } | Array<{ name: string }> | null;
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const session = await requireRole("staff");
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: orderData } = await supabase
    .from("orders")
    .select(
      "id,invoice_number,customer_name,customer_phone,customer_email,notes,subtotal,discount_amount,total_amount,status,created_at",
    )
    .eq("id", id)
    .eq("branch_id", session.branchId)
    .maybeSingle();

  if (!orderData) {
    notFound();
  }

  const { data: linesData } = await supabase
    .from("order_lines")
    .select("id,line_type,quantity,weight_kg,unit_price,price_per_kg,line_total,items(name)")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const order = orderData as OrderRow;
  const lines = ((linesData ?? []) as unknown as OrderLineRow[]).map((line) => {
    const itemName = Array.isArray(line.items)
      ? (line.items[0]?.name ?? null)
      : (line.items?.name ?? null);

    return {
      ...line,
      items: itemName ? { name: itemName } : null,
    };
  });

  return (
    <PortalShell
      role={session.role}
      branchId={session.branchId}
      title={`Invoice ${order.invoice_number}`}
      description="Receipt template and printable invoice view."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/staff"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium"
          >
            Back to POS
          </Link>
          <a
            href={`/api/invoices/${order.id}/pdf`}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          >
            Download PDF
          </a>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <header className="border-b border-slate-200 pb-4">
            <h2 className="text-xl font-semibold text-slate-900">Spinfinity Laundry Lounge</h2>
            <p className="text-sm text-slate-600">Invoice #{order.invoice_number}</p>
            <p className="text-xs text-slate-500">
              Created: {new Date(order.created_at).toLocaleString()} | Status: {order.status}
            </p>
          </header>

          <div className="mt-4 grid gap-2 text-sm md:grid-cols-2">
            <p>
              <span className="font-medium text-slate-700">Customer:</span> {order.customer_name}
            </p>
            <p>
              <span className="font-medium text-slate-700">Phone:</span>{" "}
              {order.customer_phone ?? "-"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Email:</span>{" "}
              {order.customer_email ?? "-"}
            </p>
            <p>
              <span className="font-medium text-slate-700">Branch:</span> {session.branchId}
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="border border-slate-200 px-2 py-2">Item</th>
                  <th className="border border-slate-200 px-2 py-2">Type</th>
                  <th className="border border-slate-200 px-2 py-2">Qty/Kg</th>
                  <th className="border border-slate-200 px-2 py-2">Rate</th>
                  <th className="border border-slate-200 px-2 py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td className="border border-slate-200 px-2 py-2">
                      {line.items?.name ?? "Item"}
                    </td>
                    <td className="border border-slate-200 px-2 py-2">{line.line_type}</td>
                    <td className="border border-slate-200 px-2 py-2">
                      {line.line_type === "itemized"
                        ? Number(line.quantity ?? 0).toFixed(3)
                        : `${Number(line.weight_kg ?? 0).toFixed(3)} kg`}
                    </td>
                    <td className="border border-slate-200 px-2 py-2">
                      {line.line_type === "itemized"
                        ? `KES ${Number(line.unit_price ?? 0).toFixed(2)}`
                        : `KES ${Number(line.price_per_kg ?? 0).toFixed(2)} / kg`}
                    </td>
                    <td className="border border-slate-200 px-2 py-2">
                      KES {Number(line.line_total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>KES {Number(order.subtotal).toFixed(2)}</span>
            </p>
            <p className="flex justify-between">
              <span>Discount</span>
              <span>KES {Number(order.discount_amount).toFixed(2)}</span>
            </p>
            <p className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
              <span>Total</span>
              <span>KES {Number(order.total_amount).toFixed(2)}</span>
            </p>
          </div>

          {order.notes ? (
            <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Notes: {order.notes}
            </p>
          ) : null}
        </section>
      </div>
    </PortalShell>
  );
}
