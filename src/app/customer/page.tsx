import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateCustomerProfileAction } from "@/app/customer/actions";

type CustomerPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
};

type OrderRow = {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

function readParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export default async function CustomerPage({ searchParams }: CustomerPageProps) {
  const session = await requireRole("customer");
  const supabase = await createServerSupabaseClient();
  const params = (await searchParams) ?? {};
  const success = readParam(params.success);
  const error = readParam(params.error);

  const [profileRes, activeOrdersRes, historyOrdersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,phone,address,email")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id,invoice_number,status,total_amount,created_at")
      .eq("customer_id", session.userId)
      .not("status", "in", "(completed,closed)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("id,invoice_number,status,total_amount,created_at")
      .eq("customer_id", session.userId)
      .in("status", ["completed", "closed"])
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const profile = (profileRes.data ?? null) as ProfileRow | null;
  const activeOrders = (activeOrdersRes.data ?? []) as OrderRow[];
  const historyOrders = (historyOrdersRes.data ?? []) as OrderRow[];

  return (
    <PortalShell
      role={session.role}
      branchId={session.branchId}
      title="Customer Portal"
      description="Manage your details and track current and previous laundry orders."
    >
      <div className="space-y-6">
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Profile updated successfully.
          </p>
        ) : null}
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </p>
        ) : null}
        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">My Details</h2>
          <form action={updateCustomerProfileAction} className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              name="full_name"
              required
              defaultValue={profile?.full_name ?? ""}
              placeholder="Full name"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              defaultValue={profile?.email ?? ""}
              disabled
              className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
            />
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              placeholder="Phone"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              name="address"
              defaultValue={profile?.address ?? ""}
              placeholder="Address"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white md:col-span-2">
              Update Details
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Current Orders</h2>
          <div className="mt-3 space-y-2">
            {activeOrders.length === 0 ? (
              <p className="text-sm text-slate-600">No active orders.</p>
            ) : (
              activeOrders.map((order) => (
                <div key={order.id} className="rounded-md border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-900">{order.invoice_number}</p>
                  <p className="text-slate-600">
                    Status: {order.status} | Total: KES {Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 p-4">
          <h2 className="text-lg font-semibold text-slate-900">Order History</h2>
          <div className="mt-3 space-y-2">
            {historyOrders.length === 0 ? (
              <p className="text-sm text-slate-600">No completed orders yet.</p>
            ) : (
              historyOrders.map((order) => (
                <div key={order.id} className="rounded-md border border-slate-200 p-3 text-sm">
                  <p className="font-medium text-slate-900">{order.invoice_number}</p>
                  <p className="text-slate-600">
                    Status: {order.status} | Total: KES {Number(order.total_amount).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
