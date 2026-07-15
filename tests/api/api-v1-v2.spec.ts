import { test, expect } from '../../src/fixtures/global-test-options';
import { InvestorId } from '../../src/enums';
import { FinancialUtility } from '../../src/utilities/FinancialUtility';
import { BondApiValidator } from '../../src/api/api-validators';

test.describe('API v1 vs v2 Consistency', () => {
  test('v1 uses snake_case flat shape; v2 uses camelCase nested shape', async ({
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond();
    const bond = await bondWorkflow.ensureOpen(uploaded);

    const v1 = await api.bonds.getBond(bond.id);
    const v2 = await api.bondsV2.getBond(bond.id);

    BondApiValidator.assertV1Shape(v1);
    BondApiValidator.assertV2Shape(v2);
    BondApiValidator.assertV1V2Consistency(v1, v2);
  });

  test('subscription via v2 creates portfolio entry visible in v1', async ({
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 80_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);

    const sub = await api.bondsV2.subscribeExpectSuccess(bond.id, 3_000, InvestorId.INV_005);
    expect(sub.bondId).toBe(bond.id);
    expect(sub.investorId).toBe(InvestorId.INV_005);
    expect(sub.quantity).toBe(3_000);

    const portfolio = await api.portfolio.findSubscriptionV1(InvestorId.INV_005, bond.id);
    expect(portfolio).toBeDefined();
    expect(portfolio!.quantity).toBe(3_000);
  });

  test('v2 portfolio returns wrapped data array with string-compatible amounts', async ({
    bondWorkflow,
    api,
  }) => {
    const uploaded = await bondWorkflow.uploadOpenBond({ totalSize: 20_000 });
    const bond = await bondWorkflow.ensureOpen(uploaded);
    await api.bonds.subscribeExpectSuccess(bond.id, 500, InvestorId.INV_001);

    const v2 = await api.portfolio.getPortfolioV2(InvestorId.INV_001);
    expect(v2).toHaveProperty('data');
    expect(v2).toHaveProperty('total');
    const item = v2.data.find((d) => d.bondId === bond.id);
    expect(item).toBeDefined();
  });
});

test.describe('Financial Calculation Unit Checks', () => {
  test('worked example daily coupons match PRODUCT.md', () => {
    expect(FinancialUtility.formatMoney(FinancialUtility.dailyCoupon(1000, 0.0005, 33333))).toBe(
      '16666.50',
    );
    expect(FinancialUtility.formatMoney(FinancialUtility.dailyCoupon(1000, 0.0005, 25000))).toBe(
      '12500.00',
    );
    expect(FinancialUtility.formatMoney(FinancialUtility.dailyCoupon(1000, 0.0005, 41666))).toBe(
      '20833.00',
    );
  });

  test('worked example proportional allocation matches PRODUCT.md', () => {
    const result = FinancialUtility.proportionalAllocation(
      [
        { investorId: 'INV-001', quantity: 40_000 },
        { investorId: 'INV-002', quantity: 30_000 },
        { investorId: 'INV-003', quantity: 50_000 },
      ],
      100_000,
    );
    expect(result.map((r) => r.allocatedQuantity)).toEqual([33_333, 25_000, 41_666]);
  });

  test('maturity principal is exact', () => {
    expect(FinancialUtility.formatMoney(FinancialUtility.maturityPrincipal(1000, 33333))).toBe(
      '33333000.00',
    );
  });
});
