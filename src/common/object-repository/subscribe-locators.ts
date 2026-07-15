import { Page, Locator } from '@playwright/test';
import { NavigationLocators } from './navigation-locators';

export class SubscribeLocators extends NavigationLocators {
  constructor(page: Page) {
    super(page);
  }

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: /Subscribe/i }).first();
  }

  get emptyOpenBonds(): Locator {
    return this.page.getByText('No bonds are currently open for subscription.');
  }

  get quantityInput(): Locator {
    return this.page.getByTestId('subscription-quantity');
  }

  get submitButton(): Locator {
    return this.page.getByTestId('subscription-submit');
  }

  get successMessage(): Locator {
    return this.page.getByTestId('subscription-success');
  }

  get errorMessage(): Locator {
    return this.page.getByTestId('subscription-error');
  }

  get legacyQuantityInput(): Locator {
    return this.page.getByTestId('subscribe-quantity');
  }

  get legacySubscribeButton(): Locator {
    return this.page.getByTestId('subscribe-button');
  }

  getBondOption(bondId: number | string): Locator {
    return this.page.getByTestId(`bond-option-${bondId}`);
  }

  getBondOptionByIsin(isin: string): Locator {
    return this.page.locator('[data-testid^="bond-option-"]', { hasText: isin });
  }
}
