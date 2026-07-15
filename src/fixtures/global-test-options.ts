import { test as base, APIRequestContext, request as playwrightRequest } from '@playwright/test';
import { PageManager } from '../common/object-repository/page-manager';
import { ApiClientFacade } from '../api/api-clients/ApiClientFacade';
import { BondWorkflowService } from '../factories/BondWorkflowService';
import { TestUtility } from '../utilities/TestUtility';
import { Logger } from '../utilities/Logger';
import { BondAssertions } from '../assertions/BondAssertions';
import { SubscriptionAssertions } from '../assertions/SubscriptionAssertions';
import {
  CouponAssertions,
  FinancialAssertions,
  MaturityAssertions,
} from '../assertions/CouponAssertions';
import { CsvUtility } from '../utilities/CsvUtility';
import { SftpUtility } from '../utilities/SftpUtility';
import { frameworkConfig } from '../config/framework-config';

export interface BisFixtures {
  logger: Logger;
  testUtility: TestUtility;
  pageManager: PageManager;
  api: ApiClientFacade;
  bondWorkflow: BondWorkflowService;
  csvUtility: CsvUtility;
  sftpUtility: SftpUtility;
  bondAssertions: BondAssertions;
  subscriptionAssertions: SubscriptionAssertions;
  couponAssertions: CouponAssertions;
  maturityAssertions: MaturityAssertions;
  financialAssertions: FinancialAssertions;
  businessDate: string;
  apiRequest: APIRequestContext;
  /** Auto fixture: resets business date before every test. */
  systemIsolation: void;
}

/**
 * Global test fixtures — tests never construct PageManager or API clients manually.
 */
export const test = base.extend<BisFixtures>({
  logger: async ({}, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    logger.testStart(testInfo.title);
    await use(logger);
    logger.testEnd(testInfo.title, testInfo.status ?? 'unknown');
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.failure(`Test finished with status ${testInfo.status}`);
      await testInfo.attach('session-log', {
        path: logger.getLogFilePath(),
        contentType: 'text/plain',
      });
    }
  },

  apiRequest: async ({}, use) => {
    const ctx = await playwrightRequest.newContext({
      baseURL: frameworkConfig.urls.backend,
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    await use(ctx);
    await ctx.dispose();
  },

  systemIsolation: [
    async ({ api, logger }, use) => {
      await api.system.reset();
      logger.cleanup('systemIsolation reset business date');
      await use();
    },
    { auto: true },
  ],

  testUtility: async ({ page, logger }, use) => {
    await use(new TestUtility(page, logger));
  },

  pageManager: async ({ page, testUtility }, use) => {
    await use(new PageManager(page, testUtility));
  },

  api: async ({ apiRequest, logger }, use) => {
    await use(new ApiClientFacade(apiRequest, logger));
  },

  bondWorkflow: async ({ apiRequest, logger }, use) => {
    await use(new BondWorkflowService(apiRequest, logger));
  },

  csvUtility: async ({ logger }, use) => {
    await use(new CsvUtility(logger));
  },

  sftpUtility: async ({ logger }, use) => {
    await use(new SftpUtility(logger));
  },

  bondAssertions: async ({}, use) => {
    await use(new BondAssertions());
  },

  subscriptionAssertions: async ({}, use) => {
    await use(new SubscriptionAssertions());
  },

  couponAssertions: async ({}, use) => {
    await use(new CouponAssertions());
  },

  maturityAssertions: async ({}, use) => {
    await use(new MaturityAssertions());
  },

  financialAssertions: async ({}, use) => {
    await use(new FinancialAssertions());
  },

  businessDate: async ({ api }, use) => {
    const date = await api.system.getBusinessDate();
    await use(date);
  },
});

export { expect } from '@playwright/test';
