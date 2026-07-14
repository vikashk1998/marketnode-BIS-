import { Page, Locator, expect } from '@playwright/test';
import { frameworkConfig } from '../config/framework-config';
import { Logger } from './Logger';
import { RetryUtility } from './RetryUtility';

/**
 * High-level wait helpers for element and network readiness.
 */
export class WaitUtility {
  private readonly page: Page;
  private readonly logger: Logger;
  private readonly retry: RetryUtility;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger ?? new Logger('WaitUtility');
    this.retry = new RetryUtility(this.logger);
  }

  async waitUntilVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible({ timeout: frameworkConfig.timeouts.action });
  }

  async waitUntilHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden({ timeout: frameworkConfig.timeouts.action });
  }

  async waitUntilEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled({ timeout: frameworkConfig.timeouts.action });
  }

  async waitForText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator).toContainText(text, { timeout: frameworkConfig.timeouts.action });
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle', {
      timeout: frameworkConfig.timeouts.navigation,
    });
  }

  getRetryUtility(): RetryUtility {
    return this.retry;
  }
}
