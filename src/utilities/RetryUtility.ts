import { frameworkConfig } from '../config/framework-config';
import { Logger } from './Logger';

export interface RetryOptions {
  readonly timeoutMs?: number;
  readonly intervalMs?: number;
  readonly description?: string;
}

/**
 * Polls an async predicate until it returns a non-null/non-false value or times out.
 */
export class RetryUtility {
  private readonly logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? new Logger('RetryUtility');
  }

  async until<T>(
    action: () => Promise<T | null | undefined | false>,
    options: RetryOptions = {},
  ): Promise<T> {
    const timeoutMs = options.timeoutMs ?? frameworkConfig.timeouts.sftpPoll;
    const intervalMs = options.intervalMs ?? frameworkConfig.polling.intervalMs;
    const description = options.description ?? 'condition';
    const deadline = Date.now() + timeoutMs;
    let lastError: unknown;

    while (Date.now() < deadline) {
      try {
        const result = await action();
        if (result !== null && result !== undefined && result !== false) {
          return result as T;
        }
      } catch (error) {
        lastError = error;
        this.logger.debug(`Retry attempt failed for ${description}`, String(error));
      }
      await this.sleep(intervalMs);
    }

    const message = `Timed out waiting for ${description} after ${timeoutMs}ms`;
    this.logger.error(message, lastError);
    throw new Error(message);
  }

  async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
