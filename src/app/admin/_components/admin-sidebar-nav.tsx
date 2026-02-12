"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavSection = {
  label: string;
  href: string;
  links: Array<{ href: string; label: string }>;
};

const ADMIN_SECTIONS: NavSection[] = [
  {
    label: "Registry",
    href: "/admin/registry",
    links: [
      { href: "/admin/registry/branches", label: "Branches" },
      { href: "/admin/registry/items", label: "Items" },
      { href: "/admin/registry/staff", label: "Staff" },
      { href: "/admin/registry/customers", label: "Customers" },
    ],
  },
  {
    label: "Supplies",
    href: "/admin/supplies",
    links: [
      { href: "/admin/supplies/suppliers", label: "Suppliers" },
      { href: "/admin/supplies/inventory", label: "Inventory" },
    ],
  },
  {
    label: "Finance",
    href: "/admin/finance",
    links: [
      { href: "/admin/finance/pricing", label: "Pricing" },
      { href: "/admin/finance/finances", label: "Finances" },
    ],
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-6">
      {ADMIN_SECTIONS.map((section) => {
        const sectionActive = pathname.startsWith(section.href);

        return (
          <div key={section.label} className="space-y-1">
            <p
              className={`px-3 text-xs font-semibold uppercase tracking-wider ${
                sectionActive ? "text-white" : "text-sky-100/80"
              }`}
            >
              {section.label}
            </p>
            {section.links.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-white text-[var(--brand-primary-dark)]"
                      : sectionActive
                        ? "text-white hover:bg-white/15"
                        : "text-white/90 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
