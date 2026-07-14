import { Page } from '@playwright/test';
import { MarketplaceLocators } from '../object-repository/marketplace-locators';
import { PageSyncUtility } from '../../utilities/PageSyncUtility';
import { TestUtility } from '../../utilities/TestUtility';
import type { PageManager } from '../object-repository/page-manager';
import { frameworkConfig } from '../../config/framework-config';

export class MarketplacePage extends MarketplaceLocators {
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
    await this.page.goto(frameworkConfig.urls.frontend);
    await this.pageSyncUtility.waitForLoadState('domcontentloaded');
    await this.navigateToMarketplace();
  }

  async navigateToMarketplace(): Promise<void> {
    await this.marketplaceNav.click();
    await this.pageSyncUtility.waitForLocator(this.pageHeading);
  }

  async switchUser(userId: string): Promise<void> {
    await this.userSwitcher.selectOption(userId);
    await this.pageSyncUtility.waitForLoadState('networkidle');
  }

  async viewBondByName(bondName: string): Promise<void> {
    const row = this.getBondRowByName(bondName);
    await this.pageSyncUtility.waitForLocator(row);
    await this.pageSyncUtility.clickAndWaitForResponse(
      this.getViewButtonForBondName(bondName),
      /\/api\/v[12]\/bonds\/\d+/,
    );
  }

  async viewBondByIsin(isin: string): Promise<void> {
    const row = this.getBondRowByIsin(isin);
    await this.pageSyncUtility.waitForLocator(row);
    await this.pageSyncUtility.clickAndWaitForResponse(
      this.getViewButtonForIsin(isin),
      /\/api\/v[12]\/bonds\/\d+/,
    );
  }

  async isBondVisibleByName(bondName: string): Promise<boolean> {
    return this.getBondRowByName(bondName).isVisible();
  }

  async isBondVisible(isin: string): Promise<boolean> {
    return this.getBondRowByIsin(isin).isVisible();
  }

  async waitForBondVisibleByName(bondName: string): Promise<void> {
    await this.pageSyncUtility.waitForLocator(this.getBondRowByName(bondName));
  }

  async waitForBondVisible(isin: string): Promise<void> {
    await this.pageSyncUtility.waitForLocator(this.getBondRowByIsin(isin));
  }

  async getDisplayedStatusByName(bondName: string): Promise<string> {
    const cell = this.getStatusCellByName(bondName);
    await this.pageSyncUtility.waitForLocator(cell);
    return (await cell.innerText()).trim();
  }

  async getDisplayedStatus(isin: string): Promise<string> {
    const cell = this.getStatusCell(isin);
    await this.pageSyncUtility.waitForLocator(cell);
    return (await cell.innerText()).trim();
  }
}
