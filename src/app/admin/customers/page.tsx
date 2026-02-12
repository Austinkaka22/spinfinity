import { redirect } from "next/navigation";

export default function LegacyAdminCustomersPage() {
  redirect("/admin/registry/customers");
}
