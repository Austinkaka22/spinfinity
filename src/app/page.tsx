import Link from "next/link";
import { createPickupRequestAction } from "@/app/public-actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return typeof value === "string" && value.length > 0 ? value : null;
}

type PricingRow = {
  id: string;
  pricing_model: "itemized" | "weighted";
  unit_price: number | null;
  price_per_kg: number | null;
  items: { name: string } | Array<{ name: string }> | null;
  pricing_categories: { name: string } | Array<{ name: string }> | null;
};

function readRelationName(
  relation: { name: string } | Array<{ name: string }> | null | undefined,
) {
  if (!relation) return null;
  if (Array.isArray(relation)) return relation[0]?.name ?? null;
  return relation.name;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = (await searchParams) ?? {};
  const pickupSuccess = readParam(params.pickup_success);
  const pickupError = readParam(params.pickup_error);
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("pricing_rates")
    .select(
      "id,pricing_model,unit_price,price_per_kg,items(name),pricing_categories(name)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(20);

  const pricingRows = ((data ?? []) as unknown as PricingRow[]).map((row) => ({
    ...row,
    items: readRelationName(row.items) ? { name: readRelationName(row.items)! } : null,
    pricing_categories: readRelationName(row.pricing_categories)
      ? { name: readRelationName(row.pricing_categories)! }
      : null,
  }));

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <header className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Spinfinity Laundry Lounge
              </p>
              <h1 className="mt-2 text-4xl font-bold text-slate-900">
                Laundry Done Right, Every Time
              </h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Professional cleaning, pickup and delivery, and transparent digital
                order tracking across Buruburu and Epren.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/customer/login"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium"
              >
                Customer Login
              </Link>
              <Link
                href="/staff-login"
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Services and Pricing</h2>
            <p className="mt-1 text-sm text-slate-600">
              Active rates from the system. Final invoice may combine itemized and
              weighted lines.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-left">
                    <th className="px-2 py-2">Service</th>
                    <th className="px-2 py-2">Category</th>
                    <th className="px-2 py-2">Model</th>
                    <th className="px-2 py-2">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200">
                      <td className="px-2 py-2">{row.items?.name ?? "Item"}</td>
                      <td className="px-2 py-2">
                        {row.pricing_categories?.name ?? "Standard"}
                      </td>
                      <td className="px-2 py-2">{row.pricing_model}</td>
                      <td className="px-2 py-2">
                        {row.pricing_model === "itemized"
                          ? `KES ${Number(row.unit_price ?? 0).toFixed(2)} / item`
                          : `KES ${Number(row.price_per_kg ?? 0).toFixed(2)} / kg`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pricingRows.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Pricing is being updated. Please check back shortly.
                </p>
              ) : null}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Request Laundry Pickup</h2>
            <p className="mt-1 text-sm text-slate-600">
              Submit your pickup request and the team will contact you.
            </p>
            {pickupSuccess ? (
              <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Pickup request submitted successfully.
              </p>
            ) : null}
            {pickupError ? (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {decodeURIComponent(pickupError)}
              </p>
            ) : null}
            <form action={createPickupRequestAction} className="mt-4 space-y-3">
              <input
                name="full_name"
                required
                placeholder="Full name"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="phone"
                required
                placeholder="Phone number"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="email"
                type="email"
                placeholder="Email (optional)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="pickup_address"
                required
                placeholder="Pickup address"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  name="preferred_date"
                  type="date"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  name="preferred_time"
                  type="time"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <textarea
                name="notes"
                rows={3}
                placeholder="Special instructions (optional)"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Submit Request
              </button>
            </form>
          </article>
        </section>
      </section>
    </main>
  );
}
