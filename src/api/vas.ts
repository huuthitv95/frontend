// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { User } from "./dashboard";

export interface PaymentSetting {
  currency_code: string;
  currency_mark: string;
  currency_unit: number;
  providers: PaymentProvider[];
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: string;
  secret_key?: string;
  app_id?: string;
  public_key?: string;
  merchant_id?: string;
  certificate_serial?: string;
  api_private_key?: string;
  endpoint?: string;
}

export interface ProductParameter {
  type: ProductType;
  share_link_id?: string;
  sku_id?: string;
}

export interface CreatePaymentArgs {
  product: ProductParameter;
  quantity: number;
  provider_id?: string;
  email?: string;
  language?: string;
}

export enum ProductType {
  do_not_use = 0,
  share_link = 1,
  group = 2,
  storage = 3,
  points = 4,
}

export enum PaymentStatus {
  created = "created",
  paid = "paid",
  fulfilled = "fulfilled",
  fulfill_failed = "fulfill_failed",
  canceled = "canceled",
}

export interface Payment {
  id: string;
  trade_no: string;
  name: string;
  status?: PaymentStatus;
  qyt: number;
  price_unit?: number;
  price_id?: string;
  price_one_unit?: number;
  created_at: string;
  updated_at: string;
  product_type: number;
  ticket?: string;
  price_mark?: string;
}

export interface PaymentRequest {
  payment_needed: boolean;
  url?: string;
  qr_code_preferred?: boolean;
}

export interface CreatePaymentResponse {
  payment: Payment;
  request: PaymentRequest;
}

export interface StorageProduct {
  id: string;
  name: string;
  size: number;
  time: number;
  price: number;
  chip?: string;
  points?: number;
}

export interface GroupSku {
  id: string;
  name: string;
  price: number;
  points: number;
  time: number;
  chip: string;
  des: string[];
}

export interface GiftCodeSummary {
  name: string;
  qyt: number;
  duration?: number;
}

export enum PaymentProviderType {
  stripe = "stripe",
  weixin = "weixin",
  alipay = "alipay",
  points = "points",
  custom = "custom",
}

export interface GenerateRedeemsService {
  num: number;
  product: ProductParameter;
  qyt: number;
}

export interface DeleteGiftCodeService {
  id: number;
}

export interface GiftCode {
  id: number;
  created_at: string;
  updated_at: string;
  code: string;
  used: boolean;
  qyt: number;
  used_by: number;
  product_props: ProductParameter;
  edges?: {
    user?: User;
  };
  user_hash_id?: string;
}
