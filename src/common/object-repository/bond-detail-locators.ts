import { Page, Locator } from '@playwright/test';
import { NavigationLocators } from './navigation-locators';

export class BondDetailLocators extends NavigationLocators {
  constructor(page: Page) {
    super(page);
  }

  get backToMarketplace(): Locator {
    return this.page.getByRole('button', { name: /Back to Marketplace/i });
  }

  get subscribeQuantity(): Locator {
    return this.page.getByTestId('subscribe-quantity');
  }

  get subscribeButton(): Locator {
    return this.page.getByTestId('subscribe-button');
  }

  get issuerLine(): Locator {
    return this.page.getByText(/Issued by/);
  }

  getBondNameHeading(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 1 });
  }
}
