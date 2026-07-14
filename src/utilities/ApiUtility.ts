import { APIRequestContext, APIResponse } from '@playwright/test';
import { frameworkConfig } from '../config/framework-config';
import { USER_HEADER } from '../constants';
import { Logger } from './Logger';
import { RetryUtility } from './RetryUtility';

export interface ApiCallOptions {
  readonly userId?: string;
  readonly headers?: Record<string, string>;
  readonly data?: unknown;
  readonly failOnStatusCode?: boolean;
}

/**
 * Low-level HTTP helpers shared by domain API clients.
 */
export class ApiUtility {
  private readonly request: APIRequestContext;
  private readonly logger: Logger;
  private readonly retry: RetryUtility;
  private readonly baseUrl: string;

  constructor(request: APIRequestContext, logger?: Logger) {
    this.request = request;
    this.logger = logger ?? new Logger('ApiUtility');
    this.retry = new RetryUtility(this.logger);
    this.baseUrl = frameworkConfig.urls.backend;
  }

  async get(path: string, options: ApiCallOptions = {}): Promise<APIResponse> {
    return this.send('get', path, options);
  }

  async post(path: string, options: ApiCallOptions = {}): Promise<APIResponse> {
    return this.send('post', path, options);
  }

  async parseJson<T>(response: APIResponse): Promise<T> {
    return (await response.json()) as T;
  }

  async getJson<T>(path: string, options: ApiCallOptions = {}): Promise<T> {
    const response = await this.get(path, options);
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`GET ${path} failed: ${response.status()} ${body}`);
    }
    return this.parseJson<T>(response);
  }

  async postJson<T>(path: string, options: ApiCallOptions = {}): Promise<T> {
    const response = await this.post(path, options);
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`POST ${path} failed: ${response.status()} ${body}`);
    }
    return this.parseJson<T>(response);
  }

  getRetryUtility(): RetryUtility {
    return this.retry;
  }

  getLogger(): Logger {
    return this.logger;
  }

  private async send(
    method: 'get' | 'post',
    path: string,
    options: ApiCallOptions,
  ): Promise<APIResponse> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (options.userId) {
      headers[USER_HEADER] = options.userId;
    }

    this.logger.apiRequest(method.toUpperCase(), url, options.data);
    const response =
      method === 'get'
        ? await this.request.get(url, { headers, timeout: frameworkConfig.timeouts.api })
        : await this.request.post(url, {
            headers,
            data: options.data,
            timeout: frameworkConfig.timeouts.api,
          });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }
    this.logger.apiResponse(response.status(), url, body);
    return response;
  }
}
