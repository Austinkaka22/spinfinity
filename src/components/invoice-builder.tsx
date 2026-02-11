"use client";

import { useMemo, useState } from "react";

export type BuilderItem = {
  id: string;
  name: string;
};

export type BuilderRate = {
  id: string;
  item_id: string;
  pricing_model: "itemized" | "weighted";
  unit_price: number | null;
  price_per_kg: number | null;
  pricing_category_name: string | null;
};

type InvoiceBuilderProps = {
  items: BuilderItem[];
  rates: BuilderRate[];
};

type BuilderLine = {
  id: string;
  lineType: "itemized" | "weighted";
  itemId: string;
  pricingRateId: string;
  quantity: string;
  weightKg: string;
};

function makeLine(seed: number): BuilderLine {
  return {
    id: `line-${seed}`,
    lineType: "itemized",
    itemId: "",
    pricingRateId: "",
    quantity: "1",
    weightKg: "",
  };
}

function formatRateLabel(rate: BuilderRate): string {
  const value =
    rate.pricing_model === "itemized"
      ? `KES ${Number(rate.unit_price ?? 0).toFixed(2)} / item`
      : `KES ${Number(rate.price_per_kg ?? 0).toFixed(2)} / kg`;
  const category = rate.pricing_category_name ? ` | ${rate.pricing_category_name}` : "";
  return `${value}${category}`;
}

export function InvoiceBuilder({ items, rates }: InvoiceBuilderProps) {
  const [lines, setLines] = useState<BuilderLine[]>([makeLine(1)]);

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item.name])), [items]);

  function addLine() {
    setLines((prev) => [...prev, makeLine(prev.length + 1)]);
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((line) => line.id !== id)));
  }

  function updateLine(id: string, patch: Partial<BuilderLine>) {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );
  }

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const availableRates = rates.filter(
          (rate) =>
            (!line.itemId || rate.item_id === line.itemId) &&
            rate.pricing_model === line.lineType,
        );
        const selectedRate = rates.find((rate) => rate.id === line.pricingRateId) ?? null;

        return (
          <section key={line.id} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-800">Line {index + 1}</h4>
              <button
                type="button"
                className="text-xs font-medium text-red-700"
                onClick={() => removeLine(line.id)}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              <select
                name="line_type"
                value={line.lineType}
                onChange={(event) =>
                  updateLine(line.id, {
                    lineType: event.target.value === "weighted" ? "weighted" : "itemized",
                    pricingRateId: "",
                  })
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="itemized">Itemized</option>
                <option value="weighted">Weighted</option>
              </select>
              <select
                name="item_id"
                value={line.itemId}
                onChange={(event) => updateLine(line.id, { itemId: event.target.value, pricingRateId: "" })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                name="pricing_rate_id"
                value={line.pricingRateId}
                onChange={(event) => updateLine(line.id, { pricingRateId: event.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              >
                <option value="">Select rate</option>
                {availableRates.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {itemById.get(rate.item_id) ?? "Item"} - {formatRateLabel(rate)}
                  </option>
                ))}
              </select>
              <input
                name="quantity"
                type="number"
                step="0.001"
                min="0"
                value={line.quantity}
                onChange={(event) => updateLine(line.id, { quantity: event.target.value })}
                placeholder="Quantity"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                disabled={line.lineType !== "itemized"}
                required={line.lineType === "itemized"}
              />
              <input
                name="weight_kg"
                type="number"
                step="0.001"
                min="0"
                value={line.weightKg}
                onChange={(event) => updateLine(line.id, { weightKg: event.target.value })}
                placeholder="Weight (kg)"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                disabled={line.lineType !== "weighted"}
                required={line.lineType === "weighted"}
              />
            </div>
            {selectedRate ? (
              <p className="mt-2 text-xs text-slate-600">
                Selected rate: {formatRateLabel(selectedRate)}
              </p>
            ) : null}
          </section>
        );
      })}
      <button
        type="button"
        onClick={addLine}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
      >
        Add Line
      </button>
    </div>
  );
}
