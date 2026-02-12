import { redirect } from "next/navigation";

export default function LegacyAdminItemsPage() {
  redirect("/admin/registry/items");
}
