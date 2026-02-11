import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeRole, type AppRole } from "@/lib/auth/roles";

export type UserProfile = {
  role: AppRole | null;
  branchId: string | null;
};

const PROFILE_TABLE = process.env.AUTH_PROFILE_TABLE ?? "profiles";
const PROFILE_SCHEMA = process.env.AUTH_PROFILE_SCHEMA ?? "public";
const PROFILE_USER_ID_COLUMN = process.env.AUTH_PROFILE_USER_ID_COLUMN ?? "id";
const PROFILE_ROLE_COLUMN = process.env.AUTH_PROFILE_ROLE_COLUMN ?? "role";
const PROFILE_BRANCH_COLUMN =
  process.env.AUTH_PROFILE_BRANCH_COLUMN ?? "branch_id";

export async function fetchUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const selectColumns = `${PROFILE_ROLE_COLUMN}, ${PROFILE_BRANCH_COLUMN}`;

  const queryClient =
    PROFILE_SCHEMA && PROFILE_SCHEMA !== "public"
      ? supabase.schema(PROFILE_SCHEMA)
      : supabase;

  const { data, error } = await queryClient
    .from(PROFILE_TABLE)
    .select(selectColumns)
    .eq(PROFILE_USER_ID_COLUMN, userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  if (!data) {
    return null;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const profile = data as unknown as Record<string, unknown>;
  const role = normalizeRole(profile[PROFILE_ROLE_COLUMN]);
  const branchRaw = profile[PROFILE_BRANCH_COLUMN];
  const branchId =
    typeof branchRaw === "string" && branchRaw.length > 0 ? branchRaw : null;

  return {
    role,
    branchId,
  };
}
