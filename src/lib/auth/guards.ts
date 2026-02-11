import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/lib/auth/profile";
import { getRoleHome, type AppRole } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type PortalContext = {
  userId: string;
  role: AppRole;
  branchId: string | null;
};

export async function getSessionContext(): Promise<PortalContext | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await fetchUserProfile(supabase, user.id);
  if (!profile?.role) return null;

  return {
    userId: user.id,
    role: profile.role,
    branchId: profile.branchId,
  };
}

export async function requireRole(requiredRole: AppRole): Promise<PortalContext> {
  const session = await getSessionContext();

  if (!session) {
    redirect("/sign-in?error=missing_role");
  }

  if (session.role !== requiredRole) {
    redirect(getRoleHome(session.role) ?? "/sign-in?error=missing_role");
  }

  if (requiredRole === "staff" && !session.branchId) {
    redirect("/sign-in?error=missing_branch");
  }

  return session;
}
