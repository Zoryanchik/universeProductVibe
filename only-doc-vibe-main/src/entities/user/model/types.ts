import type { ECountryCode } from "@universe-forma/global-types";

import type { EUserStatus } from "./constants/user-status";

export interface IUser {
  hadSubscription?: boolean;
  email: string;
  status: EUserStatus;
  count_uploaded_files?: number;
  id: string;
  subscription?: IUserSubscription | null;
  userEmail?: string;
  fullname?: string;
  firstName?: string;
  lastName?: string;
  countryCode?: ECountryCode;
  googleAuth?: boolean;
  active_products?: { product_id: string; expires_at: string }[];
  created_at?: string;
}

export interface IUserSubscription {
  id: string;
  isTrial: boolean;
  expiresAt: string;
  price: number;
  trial_price: number;
  currency: string;
  status: string;
  cancelCode: string | null;
  billingPeriod: string;
}
