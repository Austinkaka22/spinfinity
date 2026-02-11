export type PricingRateRecord = {
  id: string;
  item_id: string;
  pricing_model: "itemized" | "weighted";
  unit_price: number | null;
  price_per_kg: number | null;
  is_active: boolean;
};

export type InvoiceDraftLine = {
  lineType: "itemized" | "weighted";
  itemId: string;
  pricingRateId: string;
  quantity: number | null;
  weightKg: number | null;
};

export type ComputedInvoiceLine = {
  lineType: "itemized" | "weighted";
  itemId: string;
  pricingRateId: string;
  quantity: number | null;
  weightKg: number | null;
  unitPrice: number | null;
  pricePerKg: number | null;
  lineTotal: number;
};

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeLine(
  draft: InvoiceDraftLine,
  rate: PricingRateRecord,
): ComputedInvoiceLine {
  if (!rate.is_active) {
    throw new Error("Selected pricing rate is inactive.");
  }

  if (draft.itemId !== rate.item_id) {
    throw new Error("Line item and pricing rate do not match.");
  }

  if (draft.lineType !== rate.pricing_model) {
    throw new Error("Line type does not match pricing model.");
  }

  if (draft.lineType === "itemized") {
    const quantity = draft.quantity ?? 0;
    if (quantity <= 0) {
      throw new Error("Itemized line quantity must be greater than zero.");
    }
    if (rate.unit_price === null) {
      throw new Error("Itemized pricing rate has no unit price.");
    }
    const lineTotal = roundCurrency(quantity * rate.unit_price);
    return {
      lineType: "itemized",
      itemId: draft.itemId,
      pricingRateId: draft.pricingRateId,
      quantity,
      weightKg: null,
      unitPrice: rate.unit_price,
      pricePerKg: null,
      lineTotal,
    };
  }

  const weightKg = draft.weightKg ?? 0;
  if (weightKg <= 0) {
    throw new Error("Weighted line weight must be greater than zero.");
  }
  if (rate.price_per_kg === null) {
    throw new Error("Weighted pricing rate has no price per kg.");
  }

  const lineTotal = roundCurrency(weightKg * rate.price_per_kg);
  return {
    lineType: "weighted",
    itemId: draft.itemId,
    pricingRateId: draft.pricingRateId,
    quantity: null,
    weightKg,
    unitPrice: null,
    pricePerKg: rate.price_per_kg,
    lineTotal,
  };
}

export function computeTotals(lineTotals: number[], discountAmount: number) {
  const subtotal = roundCurrency(lineTotals.reduce((sum, value) => sum + value, 0));
  const clampedDiscount = Math.max(0, Math.min(discountAmount, subtotal));
  const total = roundCurrency(subtotal - clampedDiscount);

  return {
    subtotal,
    discountAmount: roundCurrency(clampedDiscount),
    total,
  };
}
