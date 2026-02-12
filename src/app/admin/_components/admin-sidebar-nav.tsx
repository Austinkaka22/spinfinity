"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ADMIN_NAV = [
  { href: "/admin/branches", label: "Branches" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/items", label: "Items" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reports", label: "Reports" },
] as const;

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 space-y-1">
      {ADMIN_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-white text-[var(--brand-primary-dark)]"
                : "text-white/90 hover:bg-white/15 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
