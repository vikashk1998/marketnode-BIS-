import { test, expect } from '../../src/fixtures/global-test-options';
import { InvestorId } from '../../src/enums';

test.describe('Portfolio API', () => {
  test('portfolio, coupons, and maturities endpoints require user context and return arrays', async ({
    api,
    bondWorkflow,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 15_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);
    await api.bonds.subscribeExpectSuccess(bond.id, 100, InvestorId.INV_004);

    const portfolio = await api.portfolio.getPortfolioV1(InvestorId.INV_004);
    expect(Array.isArray(portfolio)).toBe(true);
    expect(portfolio.some((p) => p.bond_id === bond.id)).toBe(true);

    const coupons = await api.portfolio.getCouponsV1(InvestorId.INV_004);
    expect(Array.isArray(coupons)).toBe(true);

    const maturities = await api.portfolio.getMaturitiesV1(InvestorId.INV_004);
    expect(Array.isArray(maturities)).toBe(true);
  });
});
