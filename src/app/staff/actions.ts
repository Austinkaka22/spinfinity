"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  computeLine,
  computeTotals,
  type InvoiceDraftLine,
  type PricingRateRecord,
} from "@/lib/invoices/pricing";

function textValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: string): number | null {
  if (!value) return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return num;
}

function getStringArray(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""));
}

export async function createInvoiceAction(formData: FormData) {
  const session = await requireRole("staff");
  const supabase = await createServerSupabaseClient();

  const customerName = textValue(formData, "customer_name");
  const customerPhone = textValue(formData, "customer_phone");
  const customerEmail = textValue(formData, "customer_email");
  const notes = textValue(formData, "notes");
  const discountAmount = numberOrNull(textValue(formData, "discount_amount")) ?? 0;

  if (!customerName) {
    redirect("/staff?error=Customer%20name%20is%20required");
  }

  const lineTypes = getStringArray(formData, "line_type");
  const itemIds = getStringArray(formData, "item_id");
  const pricingRateIds = getStringArray(formData, "pricing_rate_id");
  const quantities = getStringArray(formData, "quantity");
  const weights = getStringArray(formData, "weight_kg");

  if (!lineTypes.length) {
    redirect("/staff?error=Add%20at%20least%20one%20invoice%20line");
  }

  const drafts: InvoiceDraftLine[] = lineTypes.map((lineType, index) => ({
    lineType: lineType === "weighted" ? "weighted" : "itemized",
    itemId: itemIds[index] ?? "",
    pricingRateId: pricingRateIds[index] ?? "",
    quantity: numberOrNull(quantities[index] ?? ""),
    weightKg: numberOrNull(weights[index] ?? ""),
  }));

  if (drafts.some((draft) => !draft.itemId || !draft.pricingRateId)) {
    redirect("/staff?error=Each%20line%20must%20have%20item%20and%20rate");
  }

  const uniqueRateIds = [...new Set(drafts.map((line) => line.pricingRateId))];

  const { data: ratesData, error: ratesError } = await supabase
    .from("pricing_rates")
    .select("id, item_id, pricing_model, unit_price, price_per_kg, is_active")
    .in("id", uniqueRateIds);

  if (ratesError) {
    redirect(`/staff?error=${encodeURIComponent(ratesError.message)}`);
  }

  const rates = (ratesData ?? []) as PricingRateRecord[];
  const rateById = new Map(rates.map((rate) => [rate.id, rate]));

  const computedLines = drafts.map((draft) => {
    const rate = rateById.get(draft.pricingRateId);
    if (!rate) {
      throw new Error("Invalid pricing rate selected.");
    }
    return computeLine(draft, rate);
  });

  const totals = computeTotals(
    computedLines.map((line) => line.lineTotal),
    discountAmount,
  );

  const { data: invoiceData, error: invoiceNumError } = await supabase.rpc(
    "generate_invoice_number",
  );

  if (invoiceNumError || !invoiceData) {
    redirect("/staff?error=Unable%20to%20generate%20invoice%20number");
  }

  const invoiceNumber = String(invoiceData);

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      invoice_number: invoiceNumber,
      branch_id: session.branchId,
      created_by: session.userId,
      customer_name: customerName,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
      notes: notes || null,
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      total_amount: totals.total,
      status: "received",
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    redirect(`/staff?error=${encodeURIComponent(orderError?.message ?? "Order insert failed")}`);
  }

  const lineInsert = computedLines.map((line) => ({
    order_id: orderRow.id,
    line_type: line.lineType,
    item_id: line.itemId,
    pricing_rate_id: line.pricingRateId,
    quantity: line.quantity,
    weight_kg: line.weightKg,
    unit_price: line.unitPrice,
    price_per_kg: line.pricePerKg,
    line_total: line.lineTotal,
  }));

  const { error: lineError } = await supabase.from("order_lines").insert(lineInsert);

  if (lineError) {
    await supabase.from("orders").delete().eq("id", orderRow.id);
    redirect(`/staff?error=${encodeURIComponent(lineError.message)}`);
  }

  revalidatePath("/staff");
  redirect(`/staff/invoices/${orderRow.id}`);
}
