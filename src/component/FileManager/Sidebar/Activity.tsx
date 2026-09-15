// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Link, ListItem, ListItemAvatar, ListItemProps, Skeleton, styled } from "@mui/material";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInView } from "react-intersection-observer";
import { AuditLogType, FileActivity, FileResponse, FileType } from "../../../api/explorer.ts";
import { setDirectLinkManagementDialog, setVersionControlDialog } from "../../../redux/globalStateSlice.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import CrUri, { CrUriPrefix, Filesystem, newMyUri } from "../../../util/uri.ts";
import { StyledListItemText } from "../../Common/StyledComponents.tsx";
import TimeBadge from "../../Common/TimeBadge.tsx";
import UserAvatar, { AnonymousUser } from "../../Common/User/UserAvatar.tsx";
import FileBadge from "../FileBadge.tsx";

export interface ActivitiesProps extends ListItemProps {
  file?: FileResponse;
  activity?: FileActivity;
  loading?: boolean;
  onLoad?: () => void;
}

export const StyledFileBadge = styled(FileBadge)(() => ({
  paddingLeft: 8,
  paddingRight: 8,
  marginLeft: 4,
  marginRight: 4,
  marginTop: 2,
}));

const redactedUri = "redacted";

export const getLogContent = (activity: FileActivity, file?: FileResponse, onVersionClick?: (id: number) => void) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  if (!activity) {
    return undefined;
  }

  const unknown = "Unknown";
  const isInDashboard = !!onVersionClick;

  let fromRedacted = redactedUri == activity.content.from;
  let toRedacted = redactedUri == activity.content.to;
  let fromFileUri = !fromRedacted
    ? new CrUri(activity.content.from ?? CrUriPrefix + Filesystem.my)
    : newMyUri(activity.user?.id ?? "");
  let toFileUri = !toRedacted
    ? new CrUri(activity.content.to ?? CrUriPrefix + Filesystem.my)
    : newMyUri(activity.user?.id ?? "");

  let directLinkId = file?.owned ? activity.content.direct_link_id : undefined;
  if (isInDashboard) {
    if (fromFileUri.fs() == Filesystem.my && !fromFileUri.id()) {
      fromFileUri.setUsername(activity.user?.id ?? "");
    }
    if (toFileUri.fs() == Filesystem.my && !toFileUri.id()) {
      toFileUri.setUsername(activity.user?.id ?? "");
    }
    directLinkId = activity.content.direct_link_id;
  }

  switch (activity.content.category) {
    case AuditLogType.extract_archive:
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logExtractArchive"}
          components={[
            <StyledFileBadge
              variant={"outlined"}
              simplifiedFile={{
                path: toFileUri.toString(),
                type: FileType.folder,
              }}
            />,
          ]}
        />
      );
    case AuditLogType.create_archive:
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logCreateArchive"}
          components={[
            <StyledFileBadge
              variant={"outlined"}
              simplifiedFile={{
                path: toFileUri.toString(),
                type: FileType.file,
              }}
            />,
          ]}
        />
      );

    case AuditLogType.relocate:
      return t("fileManager.logRelocate", {
        newPolicy: activity.content.storage_policy,
      });
    case AuditLogType.edit_share:
      return t("fileManager.logFileEditShare");
    case AuditLogType.delete_share:
      return t("fileManager.logFileDeleteShare");
    case AuditLogType.file_create:
      return t("fileManager.logFileCreate");
    case AuditLogType.file_rename:
      return t("fileManager.logFileRename", {
        originalName: activity.content.original_name,
        newName: activity.content.new_name,
      });
    case AuditLogType.set_file_permission:
      return t("fileManager.logFileSetPermission");
    case AuditLogType.file_imported:
      return t("fileManager.logFileImported");
    case AuditLogType.thumb_generated:
      return t("fileManager.logFileThumbGenerated");
    case AuditLogType.live_photo_uploaded:
      return t("fileManager.logFileLivePhotoUploaded");
    case AuditLogType.mount:
      return t("fileManager.logFileMount", {
        name: activity.content.storage_policy,
      });
    case AuditLogType.entity_uploaded:
      if (activity.version_id) {
        return (
          <>
            {t("fileManager.logFileEntityUpload") + " "}
            <Link
              href={"#"}
              underline={"hover"}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                file
                  ? dispatch(
                      setVersionControlDialog({
                        open: true,
                        file: file,
                        highlight: activity.version_id,
                      }),
                    )
                  : onVersionClick?.(parseInt(activity.version_id ?? "0"));
              }}
            >
              {t("fileManager.lookForThisVersion")}
            </Link>
          </>
        );
      }
      return t("fileManager.logFileEntityUpload");
    case AuditLogType.copy_from: {
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logFileCopyFrom"}
          components={[
            <StyledFileBadge
              variant={"outlined"}
              simplifiedFile={{
                path: fromFileUri.toString(),
                type: !fromRedacted ? FileType.file : FileType.folder,
              }}
            />,
            <StyledFileBadge
              variant={"outlined"}
              clickable={!toRedacted}
              simplifiedFile={{
                path: toFileUri.toString(),
                type: FileType.folder,
              }}
            />,
          ]}
        />
      );
    }
    case AuditLogType.copy_to: {
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logFileCopyTo"}
          components={[
            <StyledFileBadge
              variant={"outlined"}
              sx={{ px: 1, mx: 0.5 }}
              simplifiedFile={{
                path: fromFileUri.toString(),
                type: !fromRedacted ? FileType.file : FileType.folder,
              }}
            />,
            <StyledFileBadge
              clickable={!toRedacted}
              variant={"outlined"}
              sx={{ px: 1, mx: 0.5 }}
              simplifiedFile={{
                path: toFileUri.toString(),
                type: FileType.folder,
              }}
            />,
          ]}
        />
      );
    }
    case AuditLogType.move_to: {
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logFileMoveTo"}
          components={[
            <StyledFileBadge
              variant={"outlined"}
              clickable={!fromRedacted}
              sx={{ px: 1, mx: 0.5 }}
              simplifiedFile={{
                path: fromFileUri.parent().toString(),
                type: FileType.folder,
              }}
            />,
            <StyledFileBadge
              clickable={!toRedacted}
              variant={"outlined"}
              sx={{ px: 1, mx: 0.5 }}
              simplifiedFile={{
                path: toFileUri.toString(),
                type: FileType.folder,
              }}
            />,
          ]}
        />
      );
    }
    case AuditLogType.move_to_trash:
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logFileMoveToTrash"}
          components={[
            <StyledFileBadge
              clickable={!fromRedacted}
              variant={"outlined"}
              sx={{ px: 1, mx: 0.5 }}
              simplifiedFile={{
                path: fromFileUri.parent().toString(),
                type: FileType.folder,
              }}
            />,
          ]}
        />
      );
    case AuditLogType.share:
      return t("fileManager.logFileShare");
    case AuditLogType.set_current_version:
      if (!activity.content.entity_create_time) {
        return unknown;
      }
      return (
        <>
          <Trans
            ns={"application"}
            i18nKey={"fileManager.logFileSetCurrentVersion"}
            components={[<TimeBadge variant={"inherit"} datetime={activity.content.entity_create_time} />]}
          />
          {activity.version_id && (
            <>
              {" "}
              <Link
                href={"#"}
                underline={"hover"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  file
                    ? dispatch(
                        setVersionControlDialog({
                          open: true,
                          file: file,
                          highlight: activity.version_id,
                        }),
                      )
                    : onVersionClick?.(parseInt(activity.version_id ?? "0"));
                }}
              >
                {t("fileManager.lookForThisVersion")}
              </Link>
            </>
          )}
        </>
      );
    case AuditLogType.delete_version:
      if (!activity.content.entity_create_time) {
        return unknown;
      }
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logFileDeleteVersion"}
          components={[<TimeBadge variant={"inherit"} datetime={activity.content.entity_create_time} />]}
        />
      );
    case AuditLogType.entity_downloaded:
      if (directLinkId) {
        return (
          <Trans
            ns={"application"}
            i18nKey={"fileManager.logDirectLinkDownloaded"}
            components={[
              directLinkId && !isInDashboard ? (
                <Link
                  href={"#"}
                  underline={"hover"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dispatch(
                      setDirectLinkManagementDialog({
                        open: true,
                        file: file,
                        highlight: directLinkId,
                      }),
                    );
                  }}
                />
              ) : (
                <span />
              ),
            ]}
          />
        );
      }
      return t("fileManager.logEntityDownloaded");
    case AuditLogType.update_metadata:
      return t("fileManager.logFileUpdateMetadata");
    case AuditLogType.get_direct_link:
      return (
        <Trans
          ns={"application"}
          i18nKey={"fileManager.logGetDirectLink"}
          components={[
            directLinkId && !isInDashboard ? (
              <Link
                href={"#"}
                underline={"hover"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  dispatch(
                    setDirectLinkManagementDialog({
                      open: true,
                      file: file,
                      highlight: directLinkId,
                    }),
                  );
                }}
              />
            ) : (
              <span />
            ),
          ]}
        />
      );
    case AuditLogType.update_view:
      return t("fileManager.logUpdateView");
    case AuditLogType.delete_direct_link:
      return t("fileManager.logDeleteDirectLink");
    default:
      return unknown;
  }
};

const Activities = ({ loading, onLoad, file, activity, ...rest }: ActivitiesProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { ref, inView } = useInView({
    rootMargin: "200px 0px",
    triggerOnce: true,
    skip: !loading,
  });

  useEffect(() => {
    if (!inView) {
      return;
    }

    if (onLoad) {
      onLoad();
    }
  }, [inView]);

  return (
    <ListItem sx={{ py: 0.5 }} disablePadding ref={loading ? ref : undefined} {...rest}>
      <ListItemAvatar>
        {loading && <Skeleton variant={"circular"} width={40} height={40} />}
        {!loading && activity && <UserAvatar enablePopover user={activity.user ?? AnonymousUser} />}
      </ListItemAvatar>
      {loading && (
        <StyledListItemText
          primary={<Skeleton variant={"text"} width={100} />}
          secondary={<Skeleton variant={"text"} width={150} />}
        />
      )}
      {!loading && activity && file && (
        <StyledListItemText
          primary={
            <>
              {activity.user?.nickname ?? t("application:modals.anonymous")}
              <TimeBadge sx={{ ml: 1 }} variant={"inherit"} color={"text.secondary"} datetime={activity.created_at} />
            </>
          }
          secondary={getLogContent(activity, file)}
        />
      )}
    </ListItem>
  );
};

export default Activities;
