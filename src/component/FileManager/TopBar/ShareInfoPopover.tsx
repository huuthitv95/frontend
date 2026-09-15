// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Divider, PopoverProps, Stack, styled, Typography } from "@mui/material";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { useCallback, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import { FilePermission, Share } from "../../../api/explorer.ts";
import Boolset from "../../../util/boolset.ts";
import TimeBadge from "../../Common/TimeBadge.tsx";
import UserBadge from "../../Common/User/UserBadge.tsx";
import Eye from "../../Icons/Eye.tsx";
import LockClosedKey from "../../Icons/LockClosedKey.tsx";
import Money from "../../Icons/Money.tsx";
import Timer from "../../Icons/Timer.tsx";
import { PermissionBools } from "../FileInfo/Permission/PermissionList.tsx";
import { usePermissionSummary } from "../FileInfo/Permission/PermissionSettingItem.tsx";

interface ShareInfoPopoverProps extends PopoverProps {
  displayName: string;
  shareInfo: Share;
}

export const PropTypography = styled(Typography)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export const separator = " • ";

export interface ShareExpiresProps {
  expires?: string;
  remain_downloads?: number;
}
export const ShareExpires = ({ expires, remain_downloads }: ShareExpiresProps) => {
  const { t } = useTranslation();
  return (
    <>
      {expires && (
        <span>
          <Trans
            i18nKey="application:share.expireAt"
            components={[<TimeBadge variant={"inherit"} color={"inherit"} datetime={expires} />]}
          />
        </span>
      )}
      {expires && remain_downloads != undefined && separator}
      {remain_downloads != undefined &&
        t("application:share.expireAfterDownloads", {
          downloads: remain_downloads,
        })}
    </>
  );
};

export const ShareStatistics = ({ shareInfo }: { shareInfo: Share }) => {
  const { t } = useTranslation();
  return (
    <>
      {t("application:share.statisticsViews", {
        views: shareInfo.visited,
      })}
      {shareInfo.downloaded &&
        separator +
          t("application:share.statisticsDownloads", {
            downloads: shareInfo.downloaded,
          })}
    </>
  );
};

const ShareInfoPopover = ({ displayName, shareInfo, ...rest }: ShareInfoPopoverProps) => {
  const { t } = useTranslation();
  const stopPropagation = useCallback((e: any) => e.stopPropagation(), []);
  const permission = useMemo(() => {
    const perm: PermissionBools = {
      read: true,
      update: true,
      create: true,
      delete: true,
      share: true,
    };
    if (shareInfo.permissions) {
      const bs = new Boolset(shareInfo.permissions);
      perm.create = bs.enabled(FilePermission.create);
      perm.delete = bs.enabled(FilePermission.delete);
      perm.read = bs.enabled(FilePermission.read);
      perm.update = bs.enabled(FilePermission.update);
      perm.share = bs.enabled(FilePermission.share);
    }
    return perm;
  }, [shareInfo]);
  const permissionSummary = usePermissionSummary(permission);
  return (
    <HoverPopover
      onMouseDown={stopPropagation}
      onMouseUp={stopPropagation}
      onClick={stopPropagation}
      {...rest}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
    >
      <Box sx={{ maxWidth: "500px" }}>
        <Box sx={{ p: 1.5 }}>
          <Typography variant={"body2"}>{displayName}</Typography>
        </Box>
        <Stack spacing={1} sx={{ p: 1.5, pt: 0 }}>
          {shareInfo.unlocked && (
            <PropTypography variant={"body2"} color={"text.secondary"}>
              <LockClosedKey />
              {permissionSummary}
            </PropTypography>
          )}
          {(shareInfo.remain_downloads || shareInfo.expires) && (
            <PropTypography variant={"body2"} color={"text.secondary"}>
              <Timer />
              <ShareExpires expires={shareInfo.expires} remain_downloads={shareInfo.remain_downloads} />
            </PropTypography>
          )}
          {shareInfo.visited > 0 && (
            <PropTypography variant={"body2"} color={"text.secondary"}>
              <Eye />
              <ShareStatistics shareInfo={shareInfo} />
            </PropTypography>
          )}
          {shareInfo.price && (
            <PropTypography variant={"body2"} color={"text.secondary"}>
              <Money />
              {t("share.points", { num: shareInfo.price })}
            </PropTypography>
          )}
        </Stack>
        <Divider />
        <Box
          sx={{
            px: 1.5,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <UserBadge
            sx={{ width: 20, height: 20 }}
            textProps={{
              variant: "body2",
            }}
            user={shareInfo.owner}
          />
          {shareInfo.created_at && (
            <TimeBadge sx={{ ml: 1 }} variant={"body2"} color={"text.secondary"} datetime={shareInfo.created_at} />
          )}
        </Box>
      </Box>
    </HoverPopover>
  );
};

export default ShareInfoPopover;
