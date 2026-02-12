import { redirect } from "next/navigation";

export default function LegacyAdminBranchesPage() {
  redirect("/admin/registry/branches");
}
