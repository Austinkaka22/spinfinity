import {
  createBranchAction,
  updateBranchAction,
} from "@/app/admin/actions";
import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import { BranchManager } from "@/app/admin/branches/branch-manager";
import { fetchAdminMasterData } from "@/app/admin/data";

export default async function AdminBranchesPage() {
  const { branches } = await fetchAdminMasterData();

  return (
    <AdminPageSection
      title="Branches"
      description="Manage operational branches, contact details, and operational status."
    >
      <BranchManager
        branches={branches}
        createAction={createBranchAction}
        updateAction={updateBranchAction}
      />
    </AdminPageSection>
  );
}
