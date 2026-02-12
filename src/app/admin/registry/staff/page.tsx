import {
  createStaffAccountAction,
  updateStaffAccountAction,
} from "@/app/admin/actions";
import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import { StaffManager } from "@/app/admin/staff/staff-manager";
import { fetchAdminMasterData } from "@/app/admin/data";

export default async function AdminStaffPage() {
  const { branches, profiles, users } = await fetchAdminMasterData();
  const emailByUserId = Object.fromEntries(users.map((user) => [user.id, user.email ?? ""]));

  return (
    <AdminPageSection
      title="Staff Accounts"
      description="Create and manage admin, staff, and driver accounts."
    >
      <StaffManager
        branches={branches}
        profiles={profiles}
        emailByUserId={emailByUserId}
        createAction={createStaffAccountAction}
        updateAction={updateStaffAccountAction}
      />
    </AdminPageSection>
  );
}
