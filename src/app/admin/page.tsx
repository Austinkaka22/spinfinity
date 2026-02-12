import Link from "next/link";
import { fetchAdminMasterData } from "@/app/admin/data";

export default async function AdminPage() {
  const { branches, profiles, items, categories, rates } =
    await fetchAdminMasterData();

  const cards = [
    { title: "Branches", value: branches.length, href: "/admin/branches" },
    { title: "Staff", value: profiles.length, href: "/admin/staff" },
    { title: "Items", value: items.length, href: "/admin/items" },
    { title: "Inventory", value: "Manage", href: "/admin/inventory" },
    { title: "Pricing Records", value: categories.length + rates.length, href: "/admin/pricing" },
    { title: "Customers", value: "View", href: "/admin/customers" },
    { title: "Reports", value: "Build", href: "/admin/reports" },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-[var(--brand-primary)]">
          Admin Dashboard
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Use the left navigation to manage each module page-by-page.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="rounded-xl border border-[var(--brand-line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--brand-primary-dark)]">
              {card.value}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
