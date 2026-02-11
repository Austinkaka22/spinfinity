import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth/guards";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type InvoiceRow = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  created_at: string;
  status: string;
  branch_id: string;
};

type InvoiceLineRow = {
  line_type: "itemized" | "weighted";
  quantity: number | null;
  weight_kg: number | null;
  unit_price: number | null;
  price_per_kg: number | null;
  line_total: number;
  items: { name: string } | Array<{ name: string }> | null;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getSessionContext();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const supabase = await createServerSupabaseClient();

  const query = supabase
    .from("orders")
    .select(
      "id,invoice_number,customer_name,customer_phone,subtotal,discount_amount,total_amount,created_at,status,branch_id",
    )
    .eq("id", id);

  const scopedQuery =
    session.role === "admin" || session.role === "driver"
      ? query
      : query.eq("branch_id", session.branchId);

  const { data: invoiceData } = await scopedQuery.maybeSingle();
  if (!invoiceData) {
    return new NextResponse("Invoice not found", { status: 404 });
  }

  const invoice = invoiceData as InvoiceRow;

  const { data: linesData } = await supabase
    .from("order_lines")
    .select("line_type,quantity,weight_kg,unit_price,price_per_kg,line_total,items(name)")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const lines = ((linesData ?? []) as unknown as InvoiceLineRow[]).map((line) => {
    const itemName = Array.isArray(line.items)
      ? (line.items[0]?.name ?? null)
      : (line.items?.name ?? null);

    return {
      ...line,
      items: itemName ? { name: itemName } : null,
    };
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 800;
  const x = 40;

  page.drawText("Spinfinity Laundry Lounge", {
    x,
    y,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 22;
  page.drawText(`Invoice: ${invoice.invoice_number}`, { x, y, size: 11, font });
  y -= 15;
  page.drawText(`Date: ${new Date(invoice.created_at).toLocaleString()}`, {
    x,
    y,
    size: 10,
    font,
  });
  y -= 15;
  page.drawText(`Customer: ${invoice.customer_name}`, { x, y, size: 10, font });
  y -= 15;
  page.drawText(`Phone: ${invoice.customer_phone ?? "-"}`, { x, y, size: 10, font });
  y -= 20;

  page.drawText("Lines", { x, y, size: 12, font: boldFont });
  y -= 16;

  lines.forEach((line, index) => {
    const qty =
      line.line_type === "itemized"
        ? `${Number(line.quantity ?? 0).toFixed(3)} qty`
        : `${Number(line.weight_kg ?? 0).toFixed(3)} kg`;
    const rate =
      line.line_type === "itemized"
        ? `KES ${Number(line.unit_price ?? 0).toFixed(2)}`
        : `KES ${Number(line.price_per_kg ?? 0).toFixed(2)} / kg`;
    const lineText = `${index + 1}. ${line.items?.name ?? "Item"} | ${line.line_type} | ${qty} | ${rate} | KES ${Number(
      line.line_total,
    ).toFixed(2)}`;
    page.drawText(lineText, { x, y, size: 9, font });
    y -= 14;
  });

  y -= 10;
  page.drawText(`Subtotal: KES ${Number(invoice.subtotal).toFixed(2)}`, {
    x,
    y,
    size: 10,
    font,
  });
  y -= 14;
  page.drawText(`Discount: KES ${Number(invoice.discount_amount).toFixed(2)}`, {
    x,
    y,
    size: 10,
    font,
  });
  y -= 14;
  page.drawText(`Total: KES ${Number(invoice.total_amount).toFixed(2)}`, {
    x,
    y,
    size: 12,
    font: boldFont,
  });

  const bytes = await pdf.save();

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"${invoice.invoice_number}.pdf\"`,
      "Cache-Control": "no-store",
    },
  });
}
