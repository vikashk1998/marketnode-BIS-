import { Page } from '@playwright/test';
import { PayoutHistoryLocators } from '../object-repository/payout-history-locators';
import { PageSyncUtility } from '../../utilities/PageSyncUtility';
import { TestUtility } from '../../utilities/TestUtility';
import type { PageManager } from '../object-repository/page-manager';

export class PayoutHistoryPage extends PayoutHistoryLocators {
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
    await this.payoutHistoryNav.click();
    await this.pageSyncUtility.waitForLocator(this.pageHeading);
  }
}
