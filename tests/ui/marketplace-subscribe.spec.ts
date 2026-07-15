import { test, expect } from '../../src/fixtures/global-test-options';
import { InvestorId } from '../../src/enums';
import { ALL_INVESTOR_IDS } from '../../src/constants';

test.describe('UI — Marketplace & Subscribe @smoke', () => {
  test('marketplace loads and shows uploaded OPEN bond', async ({
    pageManager,
    bondWorkflow,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 25_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    const marketplace = pageManager.onMarketplacePage();
    await marketplace.open();
    await marketplace.waitForBondVisibleByName(bond.bond_name);
    expect(await marketplace.isBondVisibleByName(bond.bond_name)).toBe(true);
    expect(await marketplace.getDisplayedStatusByName(bond.bond_name)).toContain('OPEN');
  });

  test('investor can subscribe via UI bond detail', async ({
    pageManager,
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 40_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    const marketplace = pageManager.onMarketplacePage();
    await marketplace.open();
    await marketplace.switchUser(InvestorId.INV_002);
    await marketplace.waitForBondVisibleByName(bond.bond_name);
    await marketplace.viewBondByName(bond.bond_name);

    await pageManager.onBondDetailPage().subscribe(1_200);

    const portfolio = await api.portfolio.findSubscriptionV1(InvestorId.INV_002, bond.id);
    expect(portfolio).toBeDefined();
    expect(portfolio!.quantity).toBe(1_200);
  });

  test('user switcher changes acting investor', async ({ pageManager }) => {
    await pageManager.onMarketplacePage().open();
    for (const investorId of ALL_INVESTOR_IDS) {
      await pageManager.onMarketplacePage().switchUser(investorId);
      await expect(pageManager.onMarketplacePage().userSwitcher).toHaveValue(investorId);
    }
  });
});

test.describe('UI — Portfolio', () => {
  test('portfolio page shows subscription after API subscribe', async ({
    pageManager,
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 30_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);
    await api.bonds.subscribeExpectSuccess(bond.id, 800, InvestorId.INV_001);

    await pageManager.onMarketplacePage().open();
    await pageManager.onMarketplacePage().switchUser(InvestorId.INV_001);
    await pageManager.onPortfolioPage().waitForSubscription(bond.bond_name);
    const text = await pageManager.onPortfolioPage().getRowText(bond.bond_name);
    expect(text).toContain('800');
  });
});
