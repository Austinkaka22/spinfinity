"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateCustomerProfileAction(formData: FormData) {
  const session = await requireRole("customer");
  const supabase = await createServerSupabaseClient();

  const fullName = readField(formData, "full_name");
  const phone = readField(formData, "phone");
  const address = readField(formData, "address");

  if (!fullName) {
    redirect("/customer?error=full_name_required");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      address: address || null,
    })
    .eq("id", session.userId);

  if (error) {
    redirect(`/customer?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/customer?success=profile_updated");
}
