import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import {
  branchRestockAction,
  receiveToBranchAction,
  receiveToStorageAction,
  rejectBranchSupplyRequestAction,
} from "@/app/admin/actions";
import { fetchAdminInventoryData } from "@/app/admin/data";
import { InventoryManagement } from "@/app/admin/supplies/inventory/inventory-management";

export default async function AdminInventoryPage() {
  const { branches, branchLevels, storageLaundryBagLevel, storageHangerLevel, restockLogs, suppliers, branchRequests, storageByItem } =
    await fetchAdminInventoryData();

  return (
    <AdminPageSection title="Inventory" description="Manage stock movements and branch restocks.">
      <InventoryManagement
        branches={branches}
        branchLevels={branchLevels}
        storageLaundryBagLevel={Number(storageLaundryBagLevel)}
        storageHangerLevel={Number(storageHangerLevel)}
        restockLogs={restockLogs}
        suppliers={suppliers}
        branchRequests={branchRequests}
        storageByItem={storageByItem}
        receiveToStorageAction={receiveToStorageAction}
        receiveToBranchAction={receiveToBranchAction}
        branchRestockAction={branchRestockAction}
        rejectBranchSupplyRequestAction={rejectBranchSupplyRequestAction}
      />
    </AdminPageSection>
  );
}
