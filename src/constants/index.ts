import { InvestorId } from '../enums';

export const CSV_HEADERS = [
  'isin',
  'issuerName',
  'bondName',
  'currency',
  'faceValue',
  'couponRate',
  'maturityDate',
  'totalSize',
  'bookOpenDate',
  'bookCloseDate',
] as const;

export const INVESTORS = {
  [InvestorId.INV_001]: { id: InvestorId.INV_001, name: 'Alpha Capital' },
  [InvestorId.INV_002]: { id: InvestorId.INV_002, name: 'Beta Fund' },
  [InvestorId.INV_003]: { id: InvestorId.INV_003, name: 'Gamma Holdings' },
  [InvestorId.INV_004]: { id: InvestorId.INV_004, name: 'Delta Partners' },
  [InvestorId.INV_005]: { id: InvestorId.INV_005, name: 'Epsilon Trust' },
} as const;

/** Ordered list of every mock investor id available in the system. */
export const ALL_INVESTOR_IDS: readonly InvestorId[] = [
  InvestorId.INV_001,
  InvestorId.INV_002,
  InvestorId.INV_003,
  InvestorId.INV_004,
  InvestorId.INV_005,
] as const;

export const USER_HEADER = 'X-User-Id';

export const BOND_CONSTRAINTS = {
  isinLength: 12,
  maxIssuerNameLength: 255,
  maxBondNameLength: 255,
  maxFaceValue: 1_000_000,
  maxTotalSize: 100_000_000,
  maxFaceValueDecimals: 2,
  maxCouponRateDecimals: 4,
  minCouponRateExclusive: 0,
  maxCouponRateExclusive: 1,
} as const;

export const API_PATHS = {
  system: {
    date: '/api/system/date',
    advanceDate: '/api/system/advance-date',
    reset: '/api/system/reset',
  },
  v1: {
    bonds: '/api/v1/bonds',
    bondById: (id: number): string => `/api/v1/bonds/${id}`,
    subscribe: (id: number): string => `/api/v1/bonds/${id}/subscribe`,
    portfolio: '/api/v1/portfolio',
    coupons: '/api/v1/portfolio/coupons',
    maturities: '/api/v1/portfolio/maturities',
  },
  v2: {
    bonds: '/api/v2/bonds',
    bondById: (id: number): string => `/api/v2/bonds/${id}`,
    subscribe: (id: number): string => `/api/v2/bonds/${id}/subscribe`,
    portfolio: '/api/v2/portfolio',
  },
} as const;

export const WEEKEND_DAYS = new Set([0, 6]); // Sunday = 0, Saturday = 6
