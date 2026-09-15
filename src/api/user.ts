// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { PaginationResults } from "./explorer.ts";
import { Payment } from "./vas.ts";

/**
 * UserLoginService 管理用户登录的服务
 */
export interface UserLoginService {
  email: string;
  password: string;
  otp?: string;
}

/**
 * User 用户序列化器
 */
export interface User {
  id: string;
  email?: string;
  nickname: string;
  status?: any /* user.Status */;
  avatar?: string;
  created_at: any /* time.Time */;
  preferred_theme?: string;
  credit?: number /* int */;
  anonymous?: boolean;
  group?: Group;
  pined?: PinedFile[];
  language?: string;
  disable_view_sync?: boolean;
  share_links_in_profile?: ShareLinksInProfileLevel;
}
export interface Group {
  id: string;
  name: string;
  permission?: string;
  direct_link_batch_size?: number;
  trash_retention?: number;
}

export interface PinedFile {
  uri: string;
  name?: string;
  readonly?: boolean;
}

export interface PrepareLoginResponse {
  webauthn_enabled: boolean;
  sso_enabled: boolean;
  oidc_enabled: boolean;
  password_enabled: boolean;
  qq_enabled: boolean;
}

export interface CaptchaRequest {
  [key: string]: any;
}

export interface PasswordLoginRequest extends CaptchaRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  access_expires: string;
  refresh_expires: string;
}

export interface LoginResponse {
  user: User;
  token: Token;
}

export interface TwoFALoginRequest {
  otp: string;
  session_id: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface Capacity {
  total: number;
  used: number;
  storage_pack_total: number;
}

export const GroupPermission = {
  is_admin: 0,
  is_anonymous: 1,
  share: 2,
  webdav: 3,
  archive_download: 4,
  archive_task: 5,
  webdav_proxy: 6,
  share_download: 7,
  share_free: 8,
  remote_download: 9,
  relocate: 10,
  redirected_source: 11,
  advance_delete: 12,
  select_node: 13,
  set_anonymous_permission: 14,
  set_explicit_user_permission: 15,
  ignore_file_permission: 16,
  unique_direct_link: 17,
  folder_direct_link: 18,
};

export interface UserSettings {
  group_expires?: string;
  open_id?: OpenID[];
  version_retention_enabled: boolean;
  version_retention_ext?: string[];
  version_retention_max?: number;
  passwordless: boolean;
  two_fa_enabled: boolean;
  passkeys?: Passkey[];
  login_activity?: LoginActivity[];
  storage_packs?: StoragePack[];
  credit: number;
  disable_view_sync: boolean;
  share_links_in_profile: ShareLinksInProfileLevel;
  oauth_grants?: OAuthGrant[];
}

export interface OAuthGrant {
  client_id: string;
  client_name: string;
  client_logo: string;
  scopes?: string[];
  last_used_at?: string;
}

export interface PatchUserSetting {
  nick?: string;
  group_expires?: boolean;
  language?: string;
  preferred_theme?: string;
  version_retention_enabled?: boolean;
  version_retention_ext?: string[];
  version_retention_max?: number;
  current_password?: string;
  new_password?: string;
  two_fa_enabled?: boolean;
  two_fa_code?: string;
  disable_view_sync?: boolean;
  share_links_in_profile?: ShareLinksInProfileLevel;
}

export enum OpenIDProvider {
  logto = 0,
  qq = 1,
  oidc = 2,
}

export interface OpenIDSignInService {
  hint?: string;
  linking?: boolean;
  provider: OpenIDProvider;
}

export interface OpenIDCallbackService {
  provider_id: OpenIDProvider;
  code: string;
  session_id: string;
}

export interface OpenID {
  provider: OpenIDProvider;
  linked_at: string;
}

export interface PasskeyCredentialOption {
  publicKey: {
    rp: {
      name: string;
      id: string;
    };
    user: {
      name: string;
      displayName: string;
      id: string;
    };
    challenge: string;
    pubKeyCredParams: {
      type: "public-key";
      alg: number;
    }[];
    timeout: number;
    excludeCredentials: {
      type: "public-key";
      id: string;
    }[];
    authenticatorSelection: {
      requireResidentKey: boolean;
      userVerification: UserVerificationRequirement;
    };
  };
}

export interface PasskeyCredentialLoginOption {
  publicKey: {
    challenge: string;
    timeout: number;
    rpId: string;
  };
}

export interface PreparePasskeyLoginResponse {
  options: PasskeyCredentialLoginOption;
  session_id: string;
}

export interface FinishPasskeyRegistrationService {
  response: string;
  name: string;
  ua: string;
}

export interface Passkey {
  id: string;
  name: string;
  created_at: string;
  used_at: string;
}

export interface FinishPasskeyLoginService {
  response: string;
  session_id: string;
}

export interface LoginActivity {
  created_at: string;
  ip: string;
  browser: string;
  device: string;
  os: string;
  login_with: string;
  open_id_provider: number;
  passkey?: string;
  success: boolean;
  webdav: boolean;
}

export interface StoragePack {
  name: string;
  active_since: string;
  expire_at: string;
  size: number;
}

export interface CreditChangeLog {
  changed_at: string;
  diff: number;
  reason: string;
}

export interface CreditChangeLogResponse {
  changes: CreditChangeLog[];
  pagination: PaginationResults;
}

export interface GetCreditLogService {
  page_size?: number;
  order_by?: string;
  order_direction?: string;
  next_page_token?: string;
}

export interface ListPaymentService extends GetCreditLogService {}

export interface ListPaymentResponse {
  payments: Payment[];
  pagination: PaginationResults;
}

export interface SignUpService extends CaptchaRequest {
  email: string;
  password: string;
  language: string;
}

export interface SendResetEmailService extends CaptchaRequest {
  email: string;
}

export interface ResetPasswordService {
  password: string;
  secret: string;
}

export enum ShareLinksInProfileLevel {
  public_share_only = "",
  all_share = "all_share",
  hide_share = "hide_share",
}

export interface AppRegistration {
  id: string;
  name: string;
  homepage_url?: string;
  description?: string;
  consented_scopes?: string[];
  icon?: string;
}

export interface GrantService {
  client_id: string;
  response_type: string;
  redirect_uri: string;
  state: string;
  scope: string;
  code_challenge?: string;
  code_challenge_method?: string;
}

export interface GrantResponse {
  code: string;
  state: string;
}
