export type PoolStatus =
  | "funding"
  | "funded"
  | "fully_funded"
  | "tokenized"
  | "all";

// This type is a merge of the old PoolItem and the new API response example
export type PoolItem = {
  // Fields from new example
  _id: string;
  assetType?: string;
  status?: PoolStatus | string;
  tokenName?: string;
  amount?: number; // Assuming this is fundedAmount
  currency?: string;
  yieldRate: number; // Now a decimal, e.g., 0.12
  totalTarget: number;
  expiryDate: string | null; // Making nullable to match old type
  blobUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Fields from old type (many are now optional)
  tokenId?: string | null;
  escrowContractId?: string | null;

  invoiceNumber?: string;
  businessName?: string;
  businessDescription?: string;
  corporateName?: string;
  corporateLogo?: string | null;
  corporateDescription?: string;

  daysLeft?: number; // This will be calculated client-side
  fundedAmount?: number; // This is now 'amount'
  fundingProgress?: number; // This will be calculated client-side
  totalInvestors?: number;
  stakerCountOnChain?: number;

  apy?: number; // This seems replaced by yieldRate
  durationInDays?: number;
  minInvestment?: number;
  maxInvestment?: number;

  verifier?: string | null;
  verifiedAt?: string | null;
  hcsTxId?: string | null;
};

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PoolListParams {
  page?: number;
  limit?: number;
  status?: PoolStatus;
  search?: string;
}
