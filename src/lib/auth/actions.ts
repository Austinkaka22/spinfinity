"use server";

import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/lib/auth/profile";
import { getRoleHome, isInternalRole, type AppRole } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getFormField(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

async function signInWithRoleValidation(
  formData: FormData,
  opts: {
    onMissingCredentialsRedirect: string;
    onErrorRedirectBase: string;
    allowRole: (role: AppRole | null) => boolean;
    fallbackRedirect: string;
  },
) {
  const email = getFormField(formData, "email");
  const password = getFormField(formData, "password");
  const nextPath = getFormField(formData, "next");

  if (!email || !password) {
    redirect(opts.onMissingCredentialsRedirect);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`${opts.onErrorRedirectBase}?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${opts.onErrorRedirectBase}?error=auth_failed`);
  }

  const profile = await fetchUserProfile(supabase, user.id);
  const role = profile?.role ?? null;
  const destination = getRoleHome(role);

  if (!destination || !opts.allowRole(role)) {
    await supabase.auth.signOut();
    redirect(opts.fallbackRedirect);
  }

  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    redirect(nextPath);
  }

  redirect(destination);
}

export async function signInStaffAction(formData: FormData) {
  return signInWithRoleValidation(formData, {
    onMissingCredentialsRedirect: "/staff-login?error=missing_credentials",
    onErrorRedirectBase: "/staff-login",
    allowRole: (role) => isInternalRole(role),
    fallbackRedirect: "/staff-login?error=staff_access_only",
  });
}

export async function signInCustomerAction(formData: FormData) {
  return signInWithRoleValidation(formData, {
    onMissingCredentialsRedirect: "/customer/login?error=missing_credentials",
    onErrorRedirectBase: "/customer/login",
    allowRole: (role) => role === "customer",
    fallbackRedirect: "/customer/login?error=customer_access_only",
  });
}

export async function signUpCustomerAction(formData: FormData) {
  const email = getFormField(formData, "email").toLowerCase();
  const password = getFormField(formData, "password");
  const fullName = getFormField(formData, "full_name");
  const phone = getFormField(formData, "phone");
  const address = getFormField(formData, "address");

  if (!email || !password || !fullName) {
    redirect("/customer/sign-up?error=missing_required_fields");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "customer",
        phone,
        address,
      },
    },
  });

  if (error) {
    redirect(`/customer/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/customer/login?success=account_created");
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/");
}
