// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { AxiosProgressEvent, CancelToken } from "axios";
import { EncryptedBlob } from "../component/Uploader/core/uploader/encrypt/blob.ts";
import i18n from "../i18n.ts";
import {
  AdminListAbuseReportResponse,
  AdminListGroupResponse,
  ListPaymentResponse as AdminListPaymentResponse,
  AdminListService,
  ListShareResponse as AdminListShareResponse,
  StoragePolicy as AdminStoragePolicy,
  AuditLog,
  BatchIDService,
  CleanupAuditLogService,
  CleanupTaskService,
  CreateStoragePolicyCorsService,
  Entity,
  FetchDiscoveryService,
  File as FileEnt,
  FinishOauthCallbackService,
  GetOAuthClientResponse,
  GetOauthRedirectService,
  GetSettingService,
  GroupEnt,
  HomepageSummary,
  License,
  ListAuditLogResponse,
  ListEntityResponse,
  ListFileResponse,
  ListGiftCodeResponse,
  ListNodeResponse,
  ListOAuthClientResponse,
  ListStoragePolicyResponse,
  ListTaskResponse,
  ListUserResponse,
  ManualRefreshLicenseService,
  Node,
  OauthCredentialStatus,
  QueueMetric,
  SetSettingService,
  Share as ShareEnt,
  Task,
  TestNodeDownloaderService,
  TestNodeService,
  TestSMTPService,
  ThumbGeneratorTestService,
  UpsertFileService,
  UpsertGroupService,
  UpsertNodeService,
  UpsertOAuthClientService,
  UpsertStoragePolicyService,
  UpsertUserService,
  User as UserEnt,
} from "./dashboard.ts";
import {
  ArchiveListFilesResponse,
  ArchiveListFilesService,
  CreateFileService,
  CreateViewerSessionService,
  DeleteFileService,
  DeleteUploadSessionService,
  DirectLink,
  FileActivitiesResponse,
  FileActivitiesService,
  FileResponse,
  FileThumbResponse,
  FileUpdateService,
  FileURLResponse,
  FileURLService,
  GetFileInfoService,
  ListFileService,
  ListResponse,
  MountPolicyService,
  MoveFileService,
  MultipleUriService,
  PatchMetadataService,
  PatchViewSyncService,
  PinFileService,
  RenameFileService,
  SetPermissionService,
  Share,
  ShareCreateService,
  StoragePolicy,
  UnlockFileService,
  UploadCredential,
  UploadSessionRequest,
  VersionControlService,
  ViewerGroup,
  ViewerSessionResponse,
} from "./explorer.ts";
import { AppError, Code, CrHeaders, defaultOpts, isRequestAbortedError, send, ThunkResponse } from "./request.ts";
import { CreateDavAccountService, DavAccount, ListDavAccountsResponse, ListDavAccountsService } from "./setting.ts";
import { ListShareResponse, ListShareService } from "./share.ts";
import { CaptchaResponse, CreateAbuseReportService, SiteConfig } from "./site.ts";
import {
  AppRegistration,
  Capacity,
  CreditChangeLogResponse,
  FinishPasskeyLoginService,
  FinishPasskeyRegistrationService,
  GetCreditLogService,
  GrantResponse,
  GrantService,
  Group,
  ListPaymentResponse,
  ListPaymentService,
  LoginResponse,
  OpenIDCallbackService,
  OpenIDProvider,
  OpenIDSignInService,
  Passkey,
  PasskeyCredentialOption,
  PasswordLoginRequest,
  PatchUserSetting,
  PrepareLoginResponse,
  PreparePasskeyLoginResponse,
  RefreshTokenRequest,
  ResetPasswordService,
  SendResetEmailService,
  SignUpService,
  Token,
  TwoFALoginRequest,
  User,
  UserSettings,
} from "./user.ts";
import {
  CreatePaymentArgs,
  CreatePaymentResponse,
  DeleteGiftCodeService,
  GenerateRedeemsService,
  GiftCode,
  GiftCodeSummary,
  Payment,
} from "./vas.ts";
import {
  ArchiveWorkflowService,
  DownloadWorkflowService,
  ImportWorkflowService,
  ListTaskService,
  NodeSummary,
  RebuildFTSIndexWorkflowService,
  RelocateWorkflowService,
  SetDownloadFilesService,
  TaskListResponse,
  TaskProgresses,
  TaskResponse,
} from "./workflow.ts";

export function sendPreparePasskeyLogin(): ThunkResponse<PreparePasskeyLoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/session/authn`,
        {
          method: "PUT",
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendReset(uid: string, req: ResetPasswordService): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/reset/${uid}`,
        {
          method: "PATCH",
          data: req,
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendUploadChunk(
  sessionID: string,
  chunk: Blob,
  index: number,
  cancel?: CancelToken,
  onProgress?: (progressEvent: AxiosProgressEvent) => void,
): ThunkResponse<UploadCredential> {
  return async (dispatch, _getState) => {
    const streaming = chunk instanceof EncryptedBlob;
    return await dispatch(
      send(
        `/file/upload/${sessionID}/${index}`,
        {
          adapter: streaming ? "fetch" : "xhr",
          data: streaming ? chunk.stream() : chunk,
          cancelToken: cancel,
          onUploadProgress: onProgress,
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            ...(streaming && { "X-Expected-Entity-Length": chunk.size?.toString() ?? "0" }),
          },
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function getArchiveListFiles(args: ArchiveListFilesService): ThunkResponse<ArchiveListFilesResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/archive`,
        { method: "GET", params: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getGiftCodeList(args: AdminListService): ThunkResponse<ListGiftCodeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/giftCodes`,
        {
          method: "POST",
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getOauthAppRegistration(app_id: string): ThunkResponse<AppRegistration> {
  return async (dispatch, _getState) => {
    return await dispatch(send(`/session/oauth/app/${app_id}`, { method: "GET" }, { ...defaultOpts }));
  };
}

export function getUserCapacity(): ThunkResponse<Capacity> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/capacity",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (e) => isRequestAbortedError(e),
        },
      ),
    );
  };
}

export function setCurrentVersion(req: VersionControlService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/version/current",
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function batchDeleteOAuthClients(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/oauthClient/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserInfo(uid: string): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/info/" + uid,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function getGiftCode(code: string): ThunkResponse<GiftCodeSummary> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/vas/giftcode/${code}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendFinishPasskeyLogin(req: FinishPasskeyLoginService): ThunkResponse<LoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/session/authn`,
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function createStoragePolicyCors(args: CreateStoragePolicyCorsService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/cors`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getGroupDetail(id: number, countUser?: boolean): ThunkResponse<GroupEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/group/${id}`,
        { method: "GET", params: { countUser: countUser ? true : undefined } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCleanupAuditLog(args: CleanupAuditLogService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/event/cleanup`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPolicyOauthUrl(args: GetOauthRedirectService): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/oauth/signin`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateViewerSession(req: CreateViewerSessionService): ThunkResponse<ViewerSessionResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/viewerSession",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function send2FALogin(req: TwoFALoginRequest): ThunkResponse<LoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/session/token/2fa",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function getTasks(req: ListTaskService): ThunkResponse<TaskListResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow",
        {
          params: req,
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getSearchUser(keyword: string): ThunkResponse<User[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/search?keyword=" + encodeURIComponent(keyword),
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendClearPermission(req: MultipleUriService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/permission",
        {
          data: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function getAuditLogList(args: AdminListService): ThunkResponse<ListAuditLogResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/event`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteGroup(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/group/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteFiles(req: DeleteFileService): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file",
        {
          data: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function sendSignout(req: RefreshTokenRequest): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/session/token",
        {
          data: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function getAbuseReportList(args: AdminListService): ThunkResponse<AdminListAbuseReportResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/abuse`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTasksPhaseProgress(id: string): ThunkResponse<TaskProgresses> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/progress/" + id,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function get2FAInitSecret(): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/setting/2fa`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateShare(req: ShareCreateService): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/share",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUpdateFile(req: FileUpdateService, data: any): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/content",
        {
          data,
          params: req,
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        },
        {
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.StaleVersion,
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function sendResetEmail(req: SendResetEmailService): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/reset`,
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendUnlockFiles(req: UnlockFileService): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/lock",
        {
          data: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          skipLockConflict: true,
        },
      ),
    );
  };
}

export function getUserShares(req: ListShareService, uid: string): ThunkResponse<ListShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/shares/${uid}`,
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendPinFile(req: PinFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/pin",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function upsertUser(args: UpsertUserService): ThunkResponse<UserEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/user${args.user.id ? `/${args.user.id}` : ""}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserDetail(id: number): ThunkResponse<UserEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/user/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendRelocate(req: RelocateWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/relocate",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileActivities(req: FileActivitiesService): ThunkResponse<FileActivitiesResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/activities",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function testNodeDownloader(args: TestNodeDownloaderService): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/node/test/downloader`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertOAuthClient(args: UpsertOAuthClientService): ThunkResponse<GetOAuthClientResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/oauthClient${args.client.id ? `/${args.client.id}` : ""}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getOIDCWellknown(args: FetchDiscoveryService): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(send(`/admin/tool/oidc`, { method: "GET", params: args }, { ...defaultOpts }));
  };
}

export function createGiftCode(args: GenerateRedeemsService): ThunkResponse<GiftCode[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/giftCodes`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileThumb(path: string, contextHint?: string): ThunkResponse<FileThumbResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/thumb",
        {
          params: { uri: path },
          method: "GET",
          headers: contextHint
            ? {
                [CrHeaders.context_hint]: contextHint,
              }
            : {},
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function getShareList(args: AdminListService): ThunkResponse<AdminListShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/share`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendRestoreFile(req: DeleteFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/restore",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function sendRevokeOAuthGrant(grant_id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/session/oauth/grant/${grant_id}`,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteOAuthClient(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/oauthClient/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteNode(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/node/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCancelDownloadTask(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/download/" + id,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendPrepareLogin(email: string): ThunkResponse<PrepareLoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/session/prepare",
        {
          params: {
            email: email,
          },
          method: "GET",
        },
        {
          ...defaultOpts,
          noCredential: true,
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.NodeFound,
        },
      ),
    );
  };
}

export function sendClearBlobUrlCache(): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/tool/entityUrlCache`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUnpinFile(req: PinFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/pin",
        {
          data: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function getGroupList(args: AdminListService): ThunkResponse<AdminListGroupResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/group`,
        {
          method: "POST",
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function testNode(args: TestNodeService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/node/test`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteGiftCode(args: DeleteGiftCodeService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/giftCodes/${args.id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeletePasskey(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/authn?id=${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPaymentList(args: AdminListService): ThunkResponse<AdminListPaymentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/payment`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendImport(req: ImportWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/import",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendLogin(req: PasswordLoginRequest): ThunkResponse<LoginResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/session/token",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          noCredential: true,
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.Continue,
        },
      ),
    );
  };
}

export function getCreditChangeLogs(req: GetCreditLogService): ThunkResponse<CreditChangeLogResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/creditChanges`,
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateAbuseReport(req: CreateAbuseReportService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/site/abuse`,
        { method: "POST", data: req },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function finishOauthCallback(args: FinishOauthCallbackService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/oauth/callback`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendLicenseRefreshManual(req: ManualRefreshLicenseService): ThunkResponse<License> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/license/refreshManual`,
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCleanupTask(args: CleanupTaskService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/queue/cleanup`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getStoragePolicyDetail(id: number, countEntity?: boolean): ThunkResponse<AdminStoragePolicy> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/${id}`,
        { method: "GET", params: { countEntity: countEntity ? true : undefined } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileInfo(req: GetFileInfoService, skipError = false): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/info",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
          bypassSnackbar: () => skipError,
        },
      ),
    );
  };
}

export function sendCreatePayment(req: CreatePaymentArgs): ThunkResponse<CreatePaymentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/vas/payment",
        {
          method: "PUT",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateFile(req: CreateFileService): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/create",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function batchDeleteAbuseReports(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/abuse/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteUser(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/user/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
          skipBatchError: args.ids.length === 1,
        },
      ),
    );
  };
}

export function sendUpdateShare(req: ShareCreateService, id: string): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/share/" + id,
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendOpenIDCallback(req: OpenIDCallbackService): ThunkResponse<LoginResponse | undefined> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/session/openid",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (e) => e instanceof AppError,
        },
      ),
    );
  };
}

export function sendCreateRemoteDownload(req: DownloadWorkflowService): ThunkResponse<TaskResponse[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/download",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: (req.src?.length ?? 0) <= 1,
        },
      ),
    );
  };
}

export function getPaymentStatus(id: string, tradeNo: string): ThunkResponse<Payment> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/vas/payment/status/${id}/${tradeNo}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileDetail(id: number): ThunkResponse<FileEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/file/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateDavAccounts(req: CreateDavAccountService): ThunkResponse<DavAccount> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/devices/dav",
        {
          method: "PUT",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function upsertNode(args: UpsertNodeService): ThunkResponse<Node> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/node${args.node.id ? `/${args.node.id}` : ""}`,
        {
          method: "PUT",
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteDirectLink(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(send(`/file/source/${id}`, { method: "DELETE" }, { ...defaultOpts }));
  };
}

export function getFileList(req: ListFileService, skipSnackbar = true): ThunkResponse<ListResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file",
        {
          params: req,
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => skipSnackbar,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function upsertStoragePolicy(args: UpsertStoragePolicyService): ThunkResponse<AdminStoragePolicy> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy${args.policy.id ? `/${args.policy.id}` : ""}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getShares(req: ListShareService): ThunkResponse<ListShareResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/share",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getShareDetail(id: number): ThunkResponse<ShareEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/share/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileDirectLinks(req: MultipleUriService): ThunkResponse<DirectLink[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/source",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
          acceptBatchPartialSuccess: true,
        },
      ),
    );
  };
}

export function sendCreateUploadSession(req: UploadSessionRequest): ThunkResponse<UploadCredential> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/upload",
        {
          data: req,
          method: "PUT",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function getShareInfo(
  id: string,
  password?: string,
  count_views?: boolean,
  owner_extended?: boolean,
): ThunkResponse<Share> {
  return async (dispatch, _getState) => {
    let uri = "/share/info/" + id;
    const query = new URLSearchParams();
    if (password && password != "") {
      query.set("password", password);
    }
    if (count_views) {
      query.set("count_views", "true");
    }
    if (owner_extended) {
      query.set("owner_extended", "true");
    }
    if (query.toString() != "") {
      uri += "?" + query.toString();
    }
    return await dispatch(
      send(
        uri,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendUnlinkOpenID(provider: OpenIDProvider): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/session/openid/${provider}`,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getAuditLogDetail(id: number): ThunkResponse<AuditLog> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/event/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteShares(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/share/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendSinUp(req: SignUpService): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          noCredential: true,
          bypassSnackbar: (e) => e instanceof AppError && e.code == Code.Continue,
        },
      ),
    );
  };
}

export function getNodeDetail(id: number): ThunkResponse<Node> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/node/${id}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPayments(req: ListPaymentService): ThunkResponse<ListPaymentResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/payments`,
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserList(args: AdminListService): ThunkResponse<ListUserResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/user`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendRefreshToken(req: RefreshTokenRequest): ThunkResponse<Token> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/session/token/refresh",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
          noCredential: true,
        },
      ),
    );
  };
}

export function sendRenameFile(req: RenameFileService): ThunkResponse<FileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/rename",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function batchDeleteEntities(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/entity/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileUrl(id: number): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/file/url/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUploadAvatar(avatar?: Blob, contentType?: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/setting/avatar`,
        {
          method: "PUT",
          data: avatar,
          headers: contentType
            ? {
                "Content-Type": contentType,
              }
            : undefined,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteDavAccount(id: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/devices/dav/${id}`,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCreateArchive(req: ArchiveWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/archive",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPolicyOauthRedirectUrl(): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/oauth/redirect`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendSetSetting(keys: SetSettingService): ThunkResponse<{
  [key: string]: string;
}> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/settings`,
        {
          method: "PATCH",
          data: keys,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getDashboardSummary(generateCharts?: boolean): ThunkResponse<HomepageSummary> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/summary?generate=${!!generateCharts}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendMetadataPatch(req: PatchMetadataService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/metadata",
        {
          data: req,
          method: "PATCH",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function getOAuthClientDetail(id: number): ThunkResponse<GetOAuthClientResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/oauthClient/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendS3LikeCompleteUpload(policyType: string, sessionId: string, sessionKey: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/callback/${policyType}/${sessionId}/${sessionKey}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function getTaskList(args: AdminListService): ThunkResponse<ListTaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/queue`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendOneDriveCompleteUpload(sessionId: string, sessionKey: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/callback/onedrive/${sessionId}/${sessionKey}`,
        {
          method: "POST",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
        },
      ),
    );
  };
}

export function sendPreparePasskeyRegistration(): ThunkResponse<PasskeyCredentialOption> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/authn`,
        {
          method: "PUT",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteShare(id: string): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/share/" + id,
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendPatchViewSync(args: PatchViewSyncService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/view`,
        { method: "PATCH", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getPolicyOauthCredentialRefreshTime(id: string): ThunkResponse<OauthCredentialStatus> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/oauth/status/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getTaskDetail(id: number): ThunkResponse<Task> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/queue/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getOneDriveDriverRoot(id: number, url: string): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/oauth/root/${id}`,
        { method: "GET", params: { url } },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendRedeemGiftCode(code: string): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/vas/giftcode/${code}/redeem`,
        {
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getSettings(keys: GetSettingService): ThunkResponse<{
  [key: string]: string;
}> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/settings`,
        {
          method: "POST",
          data: keys,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getOAuthClientList(args: AdminListService): ThunkResponse<ListOAuthClientResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/oauthClient`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteTasks(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/queue/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUpdateUserSetting(settings: PatchUserSetting): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/setting`,
        {
          method: "PATCH",
          data: settings,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getEntityDetail(id: number): ThunkResponse<Entity> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/entity/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getAvailableNodes(): ThunkResponse<NodeSummary[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/setting/nodes",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendMoveFile(req: MoveFileService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/move",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function sendTestSMTP(args: TestSMTPService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/tool/mail`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendCalibrateUserStorage(id: number): ThunkResponse<UserEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/user/${id}/calibrate`,
        { method: "POST" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendMountStoragePolicy(req: MountPolicyService): ThunkResponse<StoragePolicy[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/policy",
        {
          data: req,
          method: "PATCH",
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function sendPrepareOpenIDSignIn(args: OpenIDSignInService): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/session/openid`,
        {
          method: "PUT",
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function deleteStoragePolicy(id: number): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy/${id}`,
        { method: "DELETE" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendEmptyTrash(): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/trash",
        {
          method: "DELETE",
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function deleteVersion(req: VersionControlService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/version",
        {
          method: "DELETE",
          data: req,
        },
        {
          ...defaultOpts,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function upsertGroup(args: UpsertGroupService): ThunkResponse<GroupEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/group${args.group.id ? `/${args.group.id}` : ""}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendUpdateDavAccounts(id: string, req: CreateDavAccountService): ThunkResponse<DavAccount> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/devices/dav/${id}`,
        {
          method: "PATCH",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getStoragePolicyList(args: AdminListService): ThunkResponse<ListStoragePolicyResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/policy`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendConsentOauthApp(args: GrantService): ThunkResponse<GrantResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(`/session/oauth/consent`, { method: "POST", data: args }, { bypassSnackbar: (e) => true, ...defaultOpts }),
    );
  };
}

export function sendEmailActivate(id: string, sign: string): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/activate/${id}?sign=${encodeURIComponent(sign)}`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          noCredential: true,
        },
      ),
    );
  };
}

export function getEntityList(args: AdminListService): ThunkResponse<ListEntityResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/entity`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getWopiDiscovery(args: FetchDiscoveryService): ThunkResponse<ViewerGroup> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/tool/wopi`,
        {
          method: "GET",
          params: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getEntityUrl(id: number): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/entity/url/${id}`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getNodeList(args: AdminListService): ThunkResponse<ListNodeResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/node`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getCaptcha(): ThunkResponse<CaptchaResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/site/captcha",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          noCredential: true,
          errorSnackbarMsg: (e) => i18n.t("login.captchaError", { ns: "application" }) + e.message,
        },
      ),
    );
  };
}

export function sendSetDownloadTarget(id: string, req: SetDownloadFilesService): ThunkResponse {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/download/" + id,
        {
          data: req,
          method: "PATCH",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getAllGroups(): ThunkResponse<Group[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/group/list",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserSettings(): ThunkResponse<UserSettings> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/setting`,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteFiles(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/file/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendSetPermission(req: SetPermissionService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/permission",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function sendTestThumbGeneratorExecutable(args: ThumbGeneratorTestService): ThunkResponse<string> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/tool/thumbExecutable`,
        {
          method: "POST",
          data: args,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getDavAccounts(req: ListDavAccountsService): ThunkResponse<ListDavAccountsResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/devices/dav",
        {
          method: "GET",
          params: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendFullTextSearch(query: string, offset?: number): ThunkResponse {
  const params = new URLSearchParams();
  params.set("query", query);
  if (offset) {
    params.set("offset", offset.toString());
  }
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/search`,
        {
          method: "GET",
          params,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getQueueMetrics(): ThunkResponse<QueueMetric[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/queue/metrics`,
        { method: "GET" },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getStoragePolicyOptions(): ThunkResponse<StoragePolicy[]> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/setting/policies",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendRebuildFTSIndex(req: RebuildFTSIndexWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/rebuildFtsIndex",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendDeleteUploadSession(req: DeleteUploadSessionService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/file/upload`,
        {
          data: req,
          method: "DELETE",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (_e) => true,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function upsertFile(args: UpsertFileService): ThunkResponse<FileEnt> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/file${args.file.id ? `/${args.file.id}` : ""}`,
        { method: "PUT", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getUserMe(): ThunkResponse<User> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/user/me",
        {
          method: "GET",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeleteAuditLogs(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/event/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getFileEntityUrl(req: FileURLService): ThunkResponse<FileURLResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/file/url",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
          skipBatchError: req.uris.length == 1,
          withPurchaseTicket: true,
        },
      ),
    );
  };
}

export function getFlattenFileList(args: AdminListService): ThunkResponse<ListFileResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/file`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function batchDeletePayments(args: BatchIDService): ThunkResponse<void> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/payment/batch/delete`,
        { method: "POST", data: args },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendLicenseRefreshAuto(): ThunkResponse<License> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/admin/license/refreshAuto`,
        {
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function getSiteConfig(section: string): ThunkResponse<SiteConfig> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/site/config/" + section,
        {
          method: "GET",
        },
        {
          ...defaultOpts,
          bypassSnackbar: (e) => isRequestAbortedError(e),
          errorSnackbarMsg: (e) => i18n.t("errLoadingSiteConfig", { ns: "common" }) + e.message,
        },
      ),
    );
  };
}

export function sendExtractArchive(req: ArchiveWorkflowService): ThunkResponse<TaskResponse> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        "/workflow/extract",
        {
          data: req,
          method: "POST",
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}

export function sendFinishPasskeyRegistration(req: FinishPasskeyRegistrationService): ThunkResponse<Passkey> {
  return async (dispatch, _getState) => {
    return await dispatch(
      send(
        `/user/authn`,
        {
          method: "POST",
          data: req,
        },
        {
          ...defaultOpts,
        },
      ),
    );
  };
}
