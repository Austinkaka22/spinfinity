import Image from "next/image";
import Link from "next/link";
import { AdminSidebarNav } from "@/app/admin/_components/admin-sidebar-nav";
import { signOutAction } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await requireRole("admin");
  const supabase = await createServerSupabaseClient();

  const [{ data: profile }, { data: authData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase.auth.getUser(),
  ]);

  const fullName = profile?.full_name ?? "Admin User";
  const email = profile?.email ?? authData.user?.email ?? "unknown@spinfinity";

  return (
    <main className="min-h-screen bg-[var(--brand-bg)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="w-72 border-r border-[var(--brand-line)] bg-[var(--brand-primary)]/95 p-5 text-white">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/Spinfinity.png"
              alt="Spinfinity"
              width={44}
              height={44}
              className="rounded-md border border-white/30 bg-white/15 object-cover"
            />
            <div>
              <p className="text-sm font-semibold tracking-wide">SPINFINITY</p>
              <p className="text-xs text-sky-100">Admin Console</p>
            </div>
          </Link>

          <AdminSidebarNav />
        </aside>

        <section className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--brand-line)] bg-white/95 px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-[var(--brand-primary)]">
                  Spinfinity Admin Portal
                </h1>
                <p className="text-sm text-slate-600">
                  Manage master data, staff operations, and reporting modules.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <p className="font-semibold text-slate-900">{fullName}</p>
                  <p className="text-slate-500">{email}</p>
                </div>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded-md border border-[var(--brand-line)] px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
