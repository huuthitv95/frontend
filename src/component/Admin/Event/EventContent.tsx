// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AuditLog } from "../../../api/dashboard";
import { AuditLogType, LogEntry } from "../../../api/explorer";
import { sizeToString } from "../../../util";
import { getLogContent } from "../../FileManager/Sidebar/Activity";
import { getEventName } from "../Settings/Event/Events";

const fileActivityTypes: number[] = [
  AuditLogType.extract_archive,
  AuditLogType.create_archive,
  AuditLogType.relocate,
  AuditLogType.edit_share,
  AuditLogType.delete_share,
  AuditLogType.file_create,
  AuditLogType.file_rename,
  AuditLogType.set_file_permission,
  AuditLogType.thumb_generated,
  AuditLogType.live_photo_uploaded,
  AuditLogType.mount,
  AuditLogType.entity_uploaded,
  AuditLogType.copy_from,
  AuditLogType.copy_to,
  AuditLogType.move_to,
  AuditLogType.move_to_trash,
  AuditLogType.share,
  AuditLogType.set_current_version,
  AuditLogType.delete_version,
  AuditLogType.entity_downloaded,
  AuditLogType.entity_downloaded,
  AuditLogType.update_metadata,
  AuditLogType.get_direct_link,
  AuditLogType.file_imported,
];

export interface EventContentProps {
  event: AuditLog;
  openEntityDialog?: (id: number) => void;
}

export const EventContent = ({ event, openEntityDialog }: EventContentProps) => {
  const { t } = useTranslation("dashboard");
  if (fileActivityTypes.includes(event.type ?? -1)) {
    return (
      <Typography variant="body2" color="text.secondary">
        {getLogContent(
          {
            content: { ...event.content } as LogEntry,
            created_at: event.created_at ?? "",
            id: event.id.toString(),
            user: {
              nickname: event.edges?.user?.nick ?? "",
              created_at: event.edges?.user?.created_at ?? "",
              id: event.user_hash_id ?? "",
            },
            version_id: event.edges?.entity?.id?.toString(),
          },
          undefined,
          openEntityDialog,
        )}
      </Typography>
    );
  }

  const content = useMemo(() => {
    switch (event.type) {
      case AuditLogType.email_sent:
        if (event.content?.error) {
          return t("event.emailFailed");
        }
        return t("event.emailSend", {
          title: event.content?.email_title ?? "",
          email: event.content?.email_to ?? "",
        });
      case AuditLogType.user_login_failed:
        return t("event.signinFailed", { reason: event.content?.error ?? "" });
      case AuditLogType.webdav_account_create:
        return t("event.createDavAccount", { account: event.content?.account ?? "" });
      case AuditLogType.webdav_account_update:
        return t("event.updateDavAccount", { account: event.content?.account ?? "" });
      case AuditLogType.webdav_account_delete:
        return t("event.deleteDavAccount", { account: event.content?.account ?? "" });
      case AuditLogType.points_change:
        return t("event.pointsChange", {
          points:
            (event.content?.points_change ?? 0) > 0 ? `+${event.content?.points_change}` : event.content?.points_change,
        });
      case AuditLogType.storage_added:
        return t("event.storageAdded", { size: sizeToString(event.content?.storage_size ?? 0) });
      case AuditLogType.change_nick:
        return t("event.nickChange", {
          old: event.content?.exts?.["from"] ?? "",
          new: event.content?.exts?.["to"] ?? "",
        });
      default:
        return t(`settings.event.${getEventName(event.type ?? 0)}`, getEventName(event.type ?? 0));
    }
  }, [event]);

  return (
    <Typography variant="body2" color="text.secondary">
      {content}
    </Typography>
  );
};
