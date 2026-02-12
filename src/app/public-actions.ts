"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function readField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function createPickupRequestAction(formData: FormData) {
  const fullName = readField(formData, "full_name");
  const phone = readField(formData, "phone");
  const email = readField(formData, "email");
  const pickupAddress = readField(formData, "pickup_address");
  const preferredDate = readField(formData, "preferred_date");
  const preferredTime = readField(formData, "preferred_time");
  const notes = readField(formData, "notes");

  if (!fullName || !phone || !pickupAddress) {
    redirect("/?pickup_error=missing_required_fields");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("pickup_requests").insert({
    full_name: fullName,
    phone,
    email: email || null,
    pickup_address: pickupAddress,
    preferred_date: preferredDate || null,
    preferred_time: preferredTime || null,
    notes: notes || null,
    status: "pending",
  });

  if (error) {
    redirect(`/?pickup_error=${encodeURIComponent(error.message)}`);
  }

  redirect("/?pickup_success=1");
}
