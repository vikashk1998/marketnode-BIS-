import { BondStatus, SubscriptionStatus } from '../enums';

/** Bond row as defined in PRODUCT.md CSV upload format. */
export interface BondCsvRow {
  readonly isin: string;
  readonly issuerName: string;
  readonly bondName: string;
  readonly currency: string;
  readonly faceValue: string;
  readonly couponRate: string;
  readonly maturityDate: string;
  readonly totalSize: string;
  readonly bookOpenDate: string;
  readonly bookCloseDate: string;
}

export interface BondTermsInput {
  readonly faceValue: number;
  readonly couponRate: number;
  readonly maturityDate: string;
  readonly totalSize: number;
  readonly bookOpenDate: string;
  readonly bookCloseDate: string;
  readonly currency: string;
  readonly issuerName: string;
  readonly bondName: string;
  readonly isin?: string;
}

/** API v1 flat bond representation. */
export interface BondV1 {
  readonly id: number;
  readonly isin: string;
  readonly issuer_name: string;
  readonly bond_name: string;
  readonly status: BondStatus | string;
  readonly currency: string;
  readonly face_value: number;
  readonly coupon_rate: number;
  readonly maturity_date: string;
  readonly total_size: number;
  readonly available_size: number;
  readonly book_open_date: string;
  readonly book_close_date: string;
  readonly subscription_count?: number;
}

/** API v2 nested bond representation. */
export interface BondV2Terms {
  readonly face_value?: number;
  readonly faceValue?: number;
  readonly couponRate: number;
  readonly maturityDate: string;
}

export interface BondV2Book {
  readonly totalSize: number;
  readonly availableSize: number;
  readonly openDate: string;
  readonly closeDate: string;
}

export interface BondV2 {
  readonly id: number;
  readonly isin: string;
  readonly issuerName: string;
  readonly bondName: string;
  readonly currency: string;
  readonly terms: BondV2Terms;
  readonly book: BondV2Book;
  readonly status: BondStatus | string;
  readonly subscriptionCount?: number;
}

export interface BondV2ListResponse {
  readonly data: readonly BondV2[];
  readonly total: number;
}

export interface SubscribeRequest {
  readonly quantity: number;
}

export interface SubscriptionV1 {
  readonly id: number;
  readonly bond_id: number;
  readonly investor_id: string;
  readonly quantity: number;
  readonly status: SubscriptionStatus | string;
  readonly allocated_quantity?: number;
}

export interface SubscriptionV2 {
  readonly id: number;
  readonly bondId: number;
  readonly investorId: string;
  readonly quantity: number;
  readonly status: SubscriptionStatus | string;
  readonly allocatedQuantity?: number;
}

export interface PortfolioItemV1 {
  readonly subscription_id: number;
  readonly bond_id: number;
  readonly bond_name: string;
  readonly quantity: number;
  readonly allocated_quantity: number;
  readonly status: SubscriptionStatus | string;
  readonly total_coupon_received: number;
  readonly next_coupon_date?: string;
  readonly maturity_date: string;
}

export interface PortfolioItemV2 {
  readonly subscriptionId: number;
  readonly bondId: number;
  readonly bondName: string;
  readonly quantity: number;
  readonly allocatedQuantity: number;
  readonly status: SubscriptionStatus | string;
  readonly totalCouponReceived: number | string;
  readonly maturityDate: string;
}

export interface PortfolioV2Response {
  readonly data: readonly PortfolioItemV2[];
  readonly total: number;
}

export interface CouponPaymentV1 {
  readonly id: number;
  readonly bond_id: number;
  readonly bond_name: string;
  readonly payment_date: string;
  readonly amount: number;
  readonly status: string;
}

export interface MaturityPaymentV1 {
  readonly id: number;
  readonly bond_id: number;
  readonly bond_name: string;
  readonly maturity_date: string;
  readonly principal_amount: number;
  readonly status: string;
}

export interface BusinessDateResponse {
  readonly business_date: string;
  readonly message?: string;
}

export interface ApiErrorBody {
  readonly error?: string;
  readonly message?: string;
  readonly status?: number;
}

export interface Investor {
  readonly id: string;
  readonly name: string;
}

export interface AllocationResult {
  readonly investorId: string;
  readonly subscribedQuantity: number;
  readonly allocatedQuantity: number;
  readonly status: SubscriptionStatus;
}
