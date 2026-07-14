import { Page } from '@playwright/test';
import { SubscribeLocators } from '../object-repository/subscribe-locators';
import { PageSyncUtility } from '../../utilities/PageSyncUtility';
import { TestUtility } from '../../utilities/TestUtility';
import type { PageManager } from '../object-repository/page-manager';

export class SubscribePage extends SubscribeLocators {
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
    await this.subscribeNav.click();
    await this.pageSyncUtility.waitForLocator(this.pageHeading);
  }

  async selectBondById(bondId: number): Promise<void> {
    const option = this.getBondOption(bondId);
    await this.pageSyncUtility.waitForLocator(option);
    await option.click();
  }

  async selectBondByIsin(isin: string): Promise<void> {
    const option = this.getBondOptionByIsin(isin);
    await this.pageSyncUtility.waitForLocator(option);
    await option.click();
  }

  async enterQuantity(quantity: number): Promise<void> {
    const input = (await this.quantityInput.count()) > 0
      ? this.quantityInput
      : this.legacyQuantityInput;
    await this.pageSyncUtility.waitForLocator(input);
    await input.fill(String(quantity));
  }

  async submitSubscription(): Promise<void> {
    const button = (await this.submitButton.count()) > 0
      ? this.submitButton
      : this.legacySubscribeButton;
    await this.pageSyncUtility.clickAndWaitForResponse(button, /\/subscribe/);
  }

  async subscribeToBond(isin: string, quantity: number): Promise<void> {
    await this.open();
    await this.selectBondByIsin(isin);
    await this.enterQuantity(quantity);
    await this.submitSubscription();
  }

  async expectSuccess(): Promise<void> {
    await this.pageSyncUtility.waitForLocator(this.successMessage);
  }

  async expectError(): Promise<void> {
    await this.pageSyncUtility.waitForLocator(this.errorMessage);
  }

  async getErrorText(): Promise<string> {
    await this.pageSyncUtility.waitForLocator(this.errorMessage);
    return (await this.errorMessage.innerText()).trim();
  }
}
