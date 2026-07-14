import { Page, Response, Locator } from '@playwright/test';
import { frameworkConfig } from '../config/framework-config';
import { Logger } from './Logger';

/**
 * Page-level synchronization — never uses hard sleeps for readiness.
 */
export class PageSyncUtility {
  private readonly page: Page;
  private readonly logger: Logger;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger ?? new Logger('PageSyncUtility');
  }

  async waitForLoadState(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'domcontentloaded',
  ): Promise<void> {
    await this.page.waitForLoadState(state, {
      timeout: frameworkConfig.timeouts.navigation,
    });
  }

  async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url, { timeout: frameworkConfig.timeouts.navigation });
  }

  async waitForLocator(locator: Locator, state: 'visible' | 'attached' | 'hidden' = 'visible'): Promise<void> {
    await locator.waitFor({ state, timeout: frameworkConfig.timeouts.action });
  }

  async waitForResponse(
    urlMatcher: string | RegExp | ((response: Response) => boolean | Promise<boolean>),
    action: () => Promise<void>,
  ): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse(urlMatcher, { timeout: frameworkConfig.timeouts.api }),
      action(),
    ]);
    this.logger.debug(`Response received: ${response.status()} ${response.url()}`);
    return response;
  }

  async clickAndWaitForResponse(
    locator: Locator,
    urlMatcher: string | RegExp,
  ): Promise<Response> {
    return this.waitForResponse(urlMatcher, async () => {
      await locator.click();
    });
  }
}
