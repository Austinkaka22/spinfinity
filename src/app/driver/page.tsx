import { PortalShell } from "@/components/portal-shell";
import { requireRole } from "@/lib/auth/guards";

export default async function DriverPage() {
  const session = await requireRole("driver");

  return (
    <PortalShell
      role={session.role}
      branchId={session.branchId}
      title="Driver Portal"
      description="Ready-for-delivery queue, customer handover, and proof-of-delivery flow."
    >
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        Milestone 1 shell is active. Delivery workflow screens come in Milestone 6.
      </div>
    </PortalShell>
  );
}
