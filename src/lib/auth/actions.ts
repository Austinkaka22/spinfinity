"use server";

import { redirect } from "next/navigation";
import { fetchUserProfile } from "@/lib/auth/profile";
import { getRoleHome } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getFormField(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(formData: FormData) {
  const email = getFormField(formData, "email");
  const password = getFormField(formData, "password");
  const nextPath = getFormField(formData, "next");

  if (!email || !password) {
    redirect("/sign-in?error=missing_credentials");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?error=auth_failed");
  }

  const profile = await fetchUserProfile(supabase, user.id);
  const destination = getRoleHome(profile?.role ?? null);

  if (!destination) {
    redirect("/sign-in?error=missing_role");
  }

  if (nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    redirect(nextPath);
  }

  redirect(destination);
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
