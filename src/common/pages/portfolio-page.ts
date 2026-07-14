import { Page } from '@playwright/test';
import { PortfolioLocators } from '../object-repository/portfolio-locators';
import { PageSyncUtility } from '../../utilities/PageSyncUtility';
import { TestUtility } from '../../utilities/TestUtility';
import type { PageManager } from '../object-repository/page-manager';

export class PortfolioPage extends PortfolioLocators {
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
    await this.portfolioNav.click();
    await this.pageSyncUtility.waitForLocator(this.pageHeading);
  }

  async waitForSubscription(bondName: string): Promise<void> {
    await this.open();
    await this.pageSyncUtility.waitForLocator(this.getRowByBondName(bondName));
  }

  async getRowText(bondName: string): Promise<string> {
    const row = this.getRowByBondName(bondName);
    await this.pageSyncUtility.waitForLocator(row);
    return (await row.innerText()).trim();
  }
}
