import { expect, Page } from '@playwright/test';
import { SystemLocators } from '../object-repository/system-locators';
import { PageSyncUtility } from '../../utilities/PageSyncUtility';
import { TestUtility } from '../../utilities/TestUtility';
import type { PageManager } from '../object-repository/page-manager';
import { frameworkConfig } from '../../config/framework-config';

const BUSINESS_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/;

export class SystemPage extends SystemLocators {
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
    // System panel fetches /api/system/date on mount; wait for that rather than the "—" placeholder.
    await this.pageSyncUtility.clickAndWaitForResponse(this.systemNav, /\/api\/system\/date/);
    await this.pageSyncUtility.waitForLocator(this.pageHeading);
    await this.waitForBusinessDateLoaded();
  }

  async waitForBusinessDateLoaded(): Promise<void> {
    await expect(this.businessDate).toHaveText(BUSINESS_DATE_PATTERN, {
      timeout: frameworkConfig.timeouts.action,
    });
  }

  async getBusinessDate(): Promise<string> {
    await this.waitForBusinessDateLoaded();
    return (await this.businessDate.innerText()).trim();
  }

  async advanceOneDay(): Promise<void> {
    const before = await this.getBusinessDate();
    await this.pageSyncUtility.clickAndWaitForResponse(
      this.advanceDateButton,
      /\/api\/system\/advance-date/,
    );
    await expect(this.businessDate).not.toHaveText(before, {
      timeout: frameworkConfig.timeouts.action,
    });
    await this.waitForBusinessDateLoaded();
  }

  async resetDate(): Promise<void> {
    await this.pageSyncUtility.clickAndWaitForResponse(
      this.resetDateButton,
      /\/api\/system\/reset/,
    );
    await this.waitForBusinessDateLoaded();
  }

  async getSystemMessage(): Promise<string> {
    await this.pageSyncUtility.waitForLocator(this.systemMessage);
    return (await this.systemMessage.innerText()).trim();
  }
}
