import { Page } from '@playwright/test';
import { Logger } from './Logger';
import { PageSyncUtility } from './PageSyncUtility';
import { WaitUtility } from './WaitUtility';
import { AssertionUtility } from './AssertionUtility';

/**
 * Shared collaboration surface injected into page classes.
 */
export class TestUtility {
  readonly page: Page;
  readonly logger: Logger;
  readonly pageSync: PageSyncUtility;
  readonly wait: WaitUtility;
  readonly assertions: AssertionUtility;

  constructor(page: Page, logger?: Logger) {
    this.page = page;
    this.logger = logger ?? new Logger('TestUtility');
    this.pageSync = new PageSyncUtility(page, this.logger);
    this.wait = new WaitUtility(page, this.logger);
    this.assertions = new AssertionUtility(this.logger);
  }
}
