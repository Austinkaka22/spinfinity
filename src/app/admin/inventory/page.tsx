import { redirect } from "next/navigation";

export default function LegacyAdminInventoryPage() {
  redirect("/admin/supplies/inventory");
}
