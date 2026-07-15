import { Page } from '@playwright/test';
import { CouponHistoryLocators } from '../object-repository/coupon-history-locators';
import { PageSyncUtility } from '../../utilities/PageSyncUtility';
import { TestUtility } from '../../utilities/TestUtility';
import type { PageManager } from '../object-repository/page-manager';

export class CouponHistoryPage extends CouponHistoryLocators {
  private readonly pageSyncUtility: PageSyncUtility;
  private readonly testUtility: TestUtility;
  private readonly pageManager: PageManager;

  constructor(page: Page, pageManager: PageManager, testUtility?: TestUtility) {
    super(page);
    this.pageManager = pageManager;
    this.testUtility = testUtility ?? new TestUtility(page);
    this.pageSyncUtility = this.testUtility.pageSync;
  }

  async open(): Promise<void> {
    await this.couponHistoryNav.click();
    await this.pageSyncUtility.waitForLocator(this.pageHeading);
  }

  async hasCouponForBond(bondName: string): Promise<boolean> {
    await this.open();
    return this.getRowByBondName(bondName).isVisible();
  }
}
