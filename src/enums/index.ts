export enum BondStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  ALLOCATED = 'ALLOCATED',
  MATURED = 'MATURED',
  CANCELLED = 'CANCELLED',
}

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ALLOCATED = 'ALLOCATED',
  REJECTED = 'REJECTED',
}

export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export enum InvestorId {
  INV_001 = 'INV-001',
  INV_002 = 'INV-002',
  INV_003 = 'INV-003',
  INV_004 = 'INV-004',
  INV_005 = 'INV-005',
}

export enum CurrencyCode {
  MYR = 'MYR',
  USD = 'USD',
  SGD = 'SGD',
  EUR = 'EUR',
  GBP = 'GBP',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum CouponPaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
}

export enum MaturityPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum UiNavSection {
  MARKETPLACE = 'marketplace',
  SUBSCRIBE = 'subscribe',
  PORTFOLIO = 'portfolio',
  COUPONS = 'coupons',
  PAYOUTS = 'payouts',
  SYSTEM = 'system',
}
