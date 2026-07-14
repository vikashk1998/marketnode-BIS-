import { test, expect } from '../../src/fixtures/global-test-options';
import { ALL_INVESTOR_IDS, INVESTORS } from '../../src/constants';
import { InvestorBuilder } from '../../src/builders/InvestorBuilder';
import { SubscriptionStatus } from '../../src/enums';

/**
 * Ensures every predefined mock investor (INV-001 … INV-005) is exercised
 * for subscription + portfolio isolation.
 */
test.describe('All Investors — API Coverage @smoke', () => {
  test('catalog exposes exactly the five predefined investors', () => {
    const investors = InvestorBuilder.all();
    expect(investors).toHaveLength(5);
    expect(investors.map((i) => i.id)).toEqual([...ALL_INVESTOR_IDS]);
    for (const investor of investors) {
      expect(investor.name).toBe(INVESTORS[investor.id as keyof typeof INVESTORS].name);
    }
  });

  test('every investor can subscribe independently to the same OPEN bond', async ({
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 500_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    const qtyByInvestor = new Map<string, number>();
    let qty = 1_000;
    for (const investorId of ALL_INVESTOR_IDS) {
      qtyByInvestor.set(investorId, qty);
      const sub = await api.bonds.subscribeExpectSuccess(bond.id, qty, investorId);
      expect(sub.investor_id).toBe(investorId);
      expect(sub.quantity).toBe(qty);
      expect(sub.status).toBe(SubscriptionStatus.PENDING);
      qty += 500;
    }

    const detail = await api.bonds.getBond(bond.id);
    expect(detail.subscription_count ?? 0).toBeGreaterThanOrEqual(ALL_INVESTOR_IDS.length);

    for (const investorId of ALL_INVESTOR_IDS) {
      const portfolio = await api.portfolio.findSubscriptionV1(investorId, bond.id);
      expect(portfolio, `portfolio missing for ${investorId}`).toBeDefined();
      expect(portfolio!.quantity).toBe(qtyByInvestor.get(investorId));
      expect(portfolio!.status).toBe(SubscriptionStatus.PENDING);
    }
  });

  test('portfolio is investor-scoped — each user only sees their own subscription', async ({
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 250_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    for (const [index, investorId] of ALL_INVESTOR_IDS.entries()) {
      await api.bonds.subscribeExpectSuccess(bond.id, (index + 1) * 100, investorId);
    }

    for (const investorId of ALL_INVESTOR_IDS) {
      const portfolio = await api.portfolio.getPortfolioV1(investorId);
      const forBond = portfolio.filter((p) => p.bond_id === bond.id);
      expect(forBond).toHaveLength(1);
      expect(forBond[0].quantity).toBe((ALL_INVESTOR_IDS.indexOf(investorId) + 1) * 100);
    }
  });

  test('each investor receives allocation after book close', async ({
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 50_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    for (const investorId of ALL_INVESTOR_IDS) {
      await api.bonds.subscribeExpectSuccess(bond.id, 5_000, investorId);
    }

    await bondWorkflow.closeAndAllocate(bond.isin);

    for (const investorId of ALL_INVESTOR_IDS) {
      const item = await api.portfolio.findSubscriptionV1(investorId, bond.id);
      expect(item, `allocation missing for ${investorId}`).toBeDefined();
      expect(item!.allocated_quantity).toBe(5_000);
      expect(item!.status).toBe(SubscriptionStatus.ALLOCATED);
    }
  });
});
