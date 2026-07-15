import { test, expect } from '../../src/fixtures/global-test-options';
import { DateUtility } from '../../src/utilities/DateUtility';

test.describe('System — Business Date Control @smoke', () => {
  test('GET /api/system/date returns ISO business date', async ({ api, logger }) => {
    const date = await api.system.getBusinessDate();
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    logger.businessDate(date);
  });

  test('POST /api/system/advance-date advances by one calendar day', async ({ api }) => {
    const before = await api.system.getBusinessDate();
    const result = await api.system.advanceDate();
    expect(result.business_date).toBe(DateUtility.addDays(before, 1));
    expect(result.message?.toLowerCase()).toContain('date advanced');
  });

  test('POST /api/system/reset restores calendar today', async ({ api }) => {
    await api.system.advanceByDays(2);
    const result = await api.system.reset();
    expect(result.business_date).toBe(DateUtility.todayIso());
  });

  test('UI System page displays and advances business date', async ({ pageManager, api }) => {
    await pageManager.onMarketplacePage().open();
    const systemPage = pageManager.onSystemPage();
    await systemPage.open();
    const apiDate = await api.system.getBusinessDate();
    const uiDate = await systemPage.getBusinessDate();
    expect(uiDate).toContain(apiDate);
    await systemPage.advanceOneDay();
    const after = await api.system.getBusinessDate();
    expect(after).toBe(DateUtility.addDays(apiDate, 1));
    await api.system.reset();
  });
});
