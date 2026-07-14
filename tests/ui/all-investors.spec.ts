import { test, expect } from '../../src/fixtures/global-test-options';
import { ALL_INVESTOR_IDS, INVESTORS } from '../../src/constants';

/**
 * UI coverage for every predefined mock investor in the user switcher.
 */
test.describe('All Investors — UI Coverage @smoke', () => {
  test('user switcher lists and can select every predefined investor', async ({
    pageManager,
  }) => {
    const marketplace = pageManager.onMarketplacePage();
    await marketplace.open();

    const options = marketplace.userSwitcher.locator('option');
    await expect(options).toHaveCount(ALL_INVESTOR_IDS.length);

    for (const investorId of ALL_INVESTOR_IDS) {
      const label = `${INVESTORS[investorId].name} (${investorId})`;
      await expect(marketplace.userSwitcher.locator(`option[value="${investorId}"]`)).toHaveText(
        label,
      );

      await marketplace.switchUser(investorId);
      await expect(marketplace.userSwitcher).toHaveValue(investorId);
    }
  });

  test('each investor can subscribe via UI and see their portfolio row', async ({
    pageManager,
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 200_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    for (const [index, investorId] of ALL_INVESTOR_IDS.entries()) {
      const quantity = 100 + index * 50;
      const marketplace = pageManager.onMarketplacePage();
      await marketplace.open();
      await marketplace.switchUser(investorId);
      await marketplace.waitForBondVisibleByName(bond.bond_name);
      await marketplace.viewBondByName(bond.bond_name);
      await pageManager.onBondDetailPage().subscribe(quantity);

      const portfolio = await api.portfolio.findSubscriptionV1(investorId, bond.id);
      expect(portfolio, `UI subscribe failed for ${investorId}`).toBeDefined();
      expect(portfolio!.quantity).toBe(quantity);

      await marketplace.open();
      await marketplace.switchUser(investorId);
      await pageManager.onPortfolioPage().waitForSubscription(bond.bond_name);
      const row = await pageManager.onPortfolioPage().getRowText(bond.bond_name);
      expect(row).toContain(String(quantity));
    }
  });
});
