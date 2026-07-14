import { Page, Locator } from '@playwright/test';
import { NavigationLocators } from './navigation-locators';

export class MarketplaceLocators extends NavigationLocators {
  constructor(page: Page) {
    super(page);
  }

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Bond Marketplace', level: 1 });
  }

  get emptyState(): Locator {
    return this.page.getByText('No bonds available.');
  }

  get loadingState(): Locator {
    return this.page.getByText('Loading bonds...');
  }

  get bondsTable(): Locator {
    return this.page.locator('table');
  }

  get viewButtons(): Locator {
    return this.page.getByRole('button', { name: 'View' });
  }

  getBondRowByName(bondName: string): Locator {
    return this.page.locator('tr', { hasText: bondName });
  }

  getBondRowByIsin(isin: string): Locator {
    // Marketplace table does not render ISIN; retained for API/UI hybrid callers
    return this.page.locator('tr', { hasText: isin });
  }

  getViewButtonForBondName(bondName: string): Locator {
    return this.getBondRowByName(bondName).getByRole('button', { name: 'View' });
  }

  getViewButtonForIsin(isin: string): Locator {
    return this.getBondRowByIsin(isin).getByRole('button', { name: 'View' });
  }

  getStatusCellByName(bondName: string): Locator {
    return this.getBondRowByName(bondName).locator('td').nth(2);
  }

  getStatusCell(isin: string): Locator {
    return this.getBondRowByIsin(isin).locator('td').nth(2);
  }
}
