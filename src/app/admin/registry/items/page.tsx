import {
  createItemAction,
  deleteItemAction,
  updateItemAction,
} from "@/app/admin/actions";
import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import { ItemManager } from "@/app/admin/items/item-manager";
import { fetchAdminMasterData } from "@/app/admin/data";

export default async function AdminItemsPage() {
  const { items } = await fetchAdminMasterData();

  return (
    <AdminPageSection
      title="Items"
      description="Manage laundry item catalog used by POS and pricing."
    >
      <ItemManager
        items={items}
        createAction={createItemAction}
        updateAction={updateItemAction}
        deleteAction={deleteItemAction}
      />
    </AdminPageSection>
  );
}
