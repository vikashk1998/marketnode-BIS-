import { Page } from '@playwright/test';
import { BondDetailLocators } from '../object-repository/bond-detail-locators';
import { PageSyncUtility } from '../../utilities/PageSyncUtility';
import { TestUtility } from '../../utilities/TestUtility';
import type { PageManager } from '../object-repository/page-manager';

export class BondDetailPage extends BondDetailLocators {
  private readonly pageSyncUtility: PageSyncUtility;
  private readonly testUtility: TestUtility;
  private readonly pageManager: PageManager;

  constructor(page: Page, pageManager: PageManager, testUtility?: TestUtility) {
    super(page);
    this.pageManager = pageManager;
    this.testUtility = testUtility ?? new TestUtility(page);
    this.pageSyncUtility = this.testUtility.pageSync;
  }

  async subscribe(quantity: number): Promise<void> {
    await this.pageSyncUtility.waitForLocator(this.subscribeQuantity);
    await this.subscribeQuantity.fill(String(quantity));
    await this.pageSyncUtility.clickAndWaitForResponse(
      this.subscribeButton,
      /\/subscribe/,
    );
  }

  async navigateBackToMarketplace(): Promise<void> {
    await this.backToMarketplace.click();
    await this.pageManager.onMarketplacePage().navigateToMarketplace();
  }
}
