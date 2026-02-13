import { createSupplierAction, updateSupplierAction } from "@/app/admin/actions";
import { fetchAdminSupplierReceipts, fetchAdminSuppliers } from "@/app/admin/data";
import { SupplierManager } from "@/app/admin/supplies/suppliers/supplier-manager";

export default async function AdminSuppliersPage() {
  const [suppliers, supplierReceipts] = await Promise.all([
    fetchAdminSuppliers(),
    fetchAdminSupplierReceipts(),
  ]);

  return (
    <SupplierManager
      suppliers={suppliers}
      receipts={supplierReceipts}
      createAction={createSupplierAction}
      updateAction={updateSupplierAction}
    />
  );
}
