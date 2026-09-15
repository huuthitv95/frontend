// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { CaptchaParams } from "../component/Common/Captcha/Captcha.tsx";
import { CustomProps, ViewerGroup } from "./explorer.ts";
import { User } from "./user.ts";
import { GroupSku, PaymentSetting, StorageProduct } from "./vas.ts";

export enum CaptchaType {
  NORMAL = "normal",
  RECAPTCHA = "recaptcha",
  // Deprecated
  TCAPTCHA = "tcaptcha",
  TURNSTILE = "turnstile",
  CAP = "cap",
}

export interface SiteConfig {
  instance_id?: string;
  title?: string;
  login_captcha?: boolean;
  reg_captcha?: boolean;
  forget_captcha?: boolean;
  abuse_report_captcha?: boolean;
  themes?: string;
  default_theme?: string;
  authn?: boolean;
  user?: User;
  captcha_ReCaptchaKey?: string;
  site_notice?: string;
  captcha_type?: CaptchaType;
  turnstile_site_id?: string;
  captcha_cap_instance_url?: string;
  captcha_cap_site_key?: string;
  captcha_cap_secret_key?: string;
  captcha_cap_asset_server?: string;
  register_enabled?: boolean;
  qq_enabled?: boolean;
  sso_enabled?: boolean;
  sso_display_name?: string;
  sso_icon?: string;
  oidc_enabled?: boolean;
  oidc_display_name?: string;
  oidc_icon?: string;
  logo?: string;
  logo_light?: string;
  tos_url?: string;
  privacy_policy_url?: string;
  icons?: string;
  emoji_preset?: string;
  point_enabled?: boolean;
  share_point_gain_rate?: number;
  map_provider?: string;
  mapbox_ak?: string;
  google_map_tile_type?: string;
  file_viewers?: ViewerGroup[];
  default_viewer_mapping?: {
    [ext: string]: string;
  };
  max_batch_size?: number;
  app_promotion?: boolean;
  desktop_app_promotion?: boolean;
  app_feedback?: string;
  app_forum?: string;
  payment?: PaymentSetting;
  anonymous_purchase?: boolean;
  point_price?: number;
  shop_nav_enabled?: boolean;
  storage_products?: StorageProduct[];
  group_skus?: GroupSku[];
  thumbnail_width?: number;
  thumbnail_height?: number;
  custom_props?: CustomProps[];
  custom_nav_items?: CustomNavItem[];
  custom_html?: CustomHTML;
  thumb_exts?: string[];
  show_encryption_status?: boolean;
  full_text_search?: boolean;
}

export interface CaptchaResponse {
  ticket: string;
  image: string;
}

export interface CustomNavItem {
  name: string;
  url: string;
  icon: string;
}

export interface CustomHTML {
  headless_footer?: string;
  headless_bottom?: string;
  sidebar_bottom?: string;
}

export interface CreateAbuseReportService extends CaptchaParams {
  file_uri?: string;
  category: number;
  description: string;
  share_id?: string;
  user_id?: string;
}
