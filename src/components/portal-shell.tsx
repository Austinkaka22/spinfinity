import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/lib/auth/actions";
import type { AppRole } from "@/lib/auth/roles";

type PortalShellProps = {
  role: AppRole;
  branchId: string | null;
  title: string;
  description: string;
  children?: ReactNode;
};

const ROLE_NAV: Record<AppRole, Array<{ href: string; label: string }>> = {
  admin: [{ href: "/admin", label: "Dashboard" }],
  staff: [{ href: "/staff", label: "POS Workspace" }],
  driver: [{ href: "/driver", label: "Delivery Queue" }],
  customer: [{ href: "/customer", label: "My Portal" }],
};

export function PortalShell({
  role,
  branchId,
  title,
  description,
  children,
}: PortalShellProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Spinfinity Portal
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
            <p className="mt-2 text-xs text-slate-500">
              Role: {role}
              {role === "staff" ? ` | Branch: ${branchId ?? "Not Assigned"}` : ""}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </form>
        </header>
        <nav className="mt-4 flex gap-3">
          {ROLE_NAV[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-medium uppercase tracking-wide text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6">{children}</div>
      </section>
    </main>
  );
}
