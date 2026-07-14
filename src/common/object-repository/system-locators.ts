import { Page, Locator } from '@playwright/test';
import { NavigationLocators } from './navigation-locators';

export class SystemLocators extends NavigationLocators {
  constructor(page: Page) {
    super(page);
  }

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { name: 'System Control', level: 1 });
  }

  get businessDate(): Locator {
    return this.page.getByTestId('business-date');
  }

  get advanceDateButton(): Locator {
    return this.page.getByTestId('advance-date-button');
  }

  get resetDateButton(): Locator {
    return this.page.getByTestId('reset-date-button');
  }

  get systemMessage(): Locator {
    return this.page.getByTestId('system-message');
  }

  get businessDateLabel(): Locator {
    return this.page.getByText('Current Business Date');
  }
}
