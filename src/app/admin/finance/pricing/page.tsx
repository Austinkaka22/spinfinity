import {
  createPricingRateAction,
  createWeightPricingTierAction,
  deletePricingRateAction,
  deleteWeightPricingTierAction,
  updatePricingRateAction,
  updateWeightPricingTierAction,
} from "@/app/admin/actions";
import { AdminPageSection } from "@/app/admin/_components/admin-page-section";
import { PricingManager } from "@/app/admin/pricing/pricing-manager";
import { fetchAdminMasterData } from "@/app/admin/data";

export default async function AdminPricingPage() {
  const { items, categories, rates, weightPricingTiers } = await fetchAdminMasterData();

  return (
    <AdminPageSection
      title="Pricing"
      description="Manage itemized pricing rates and separate kilogram-range pricing tiers."
    >
      <PricingManager
        items={items}
        categories={categories}
        rates={rates}
        weightPricingTiers={weightPricingTiers}
        createRateAction={createPricingRateAction}
        updateRateAction={updatePricingRateAction}
        deleteRateAction={deletePricingRateAction}
        createTierAction={createWeightPricingTierAction}
        updateTierAction={updateWeightPricingTierAction}
        deleteTierAction={deleteWeightPricingTierAction}
      />
    </AdminPageSection>
  );
}
