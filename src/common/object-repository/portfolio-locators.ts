import { Page, Locator } from '@playwright/test';
import { NavigationLocators } from './navigation-locators';

export class PortfolioLocators extends NavigationLocators {
  constructor(page: Page) {
    super(page);
  }

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'My Portfolio', level: 1 });
  }

  get emptyState(): Locator {
    return this.page.getByText('No subscriptions yet.');
  }

  get portfolioTable(): Locator {
    return this.page.locator('table');
  }

  getRowByBondName(bondName: string): Locator {
    return this.page.locator('tr', { hasText: bondName });
  }

  getRowByIsin(isin: string): Locator {
    return this.page.locator('tr', { hasText: isin });
  }
}
