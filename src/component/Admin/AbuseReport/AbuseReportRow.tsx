// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Checkbox, IconButton, Link, Skeleton, TableCell, TableRow, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { batchDeleteAbuseReports } from "../../../api/api";
import { AbuseReport } from "../../../api/dashboard";
import { FileType } from "../../../api/explorer";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { NoWrapTableCell, NoWrapTypography } from "../../Common/StyledComponents";
import TimeBadge from "../../Common/TimeBadge";
import UserAvatar from "../../Common/User/UserAvatar";
import FileBadge from "../../FileManager/FileBadge";
import Delete from "../../Icons/Delete";

export interface AbuseReportRowProps {
  abuseReport?: AbuseReport;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onSelect?: (id: number) => void;
  openShareDialog?: (id: number) => void;
  openUserDialog?: (id: number) => void;
}

const AbuseReportRow = ({
  abuseReport,
  loading,
  deleting,
  selected,
  onDelete,
  onSelect,
  openUserDialog,
  openShareDialog,
}: AbuseReportRowProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("abuseReport.confirmDelete"))).then(() => {
      if (abuseReport?.id) {
        setDeleteLoading(true);
        dispatch(batchDeleteAbuseReports({ ids: [abuseReport.id] }))
          .then(() => {
            onDelete?.();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      }
    });
  };

  const onSelectClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.(abuseReport?.id ?? 0);
  };

  if (loading) {
    return (
      <TableRow sx={{ height: "43px" }}>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={30} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={200} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={200} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="circular" width={24} height={24} />
        </NoWrapTableCell>
      </TableRow>
    );
  }

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const userClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    openUserDialog?.(abuseReport?.edges?.reported_user?.id ?? 0);
  };

  const shareClicked = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    e.preventDefault();
    openShareDialog?.(abuseReport?.edges?.share?.id ?? 0);
  };

  const reportTarget = useMemo(() => {
    if (abuseReport?.file_uri) {
      if (abuseReport?.edges?.share) {
        return (
          <Trans
            i18nKey="dashboard:abuseReport.shareLink"
            values={{ id: abuseReport?.edges?.share?.id }}
            components={[<Link onClick={shareClicked} underline="hover" href="#/" />]}
          />
        );
      }
      return (
        <Typography
          variant="inherit"
          sx={{
            textDecoration: "line-through",
          }}
          color="text.secondary"
        >
          {t("dashboard:abuseReport.deletedShare")}
        </Typography>
      );
    } else {
      if (abuseReport?.edges?.reported_user) {
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar
              sx={{ width: 24, height: 24 }}
              overwriteTextSize
              user={{
                id: abuseReport?.user_hash_id ?? "",
                nickname: abuseReport?.edges?.reported_user?.nick ?? "",
                created_at: abuseReport?.edges?.reported_user?.created_at ?? "",
              }}
            />
            <NoWrapTypography variant="inherit">
              <Link
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onClick={userClicked}
                underline="hover"
                href="#/"
              >
                {abuseReport?.edges?.reported_user?.nick}
              </Link>
            </NoWrapTypography>
          </Box>
        );
      } else {
        return (
          <Typography
            variant="inherit"
            sx={{
              textDecoration: "line-through",
            }}
            color="text.secondary"
          >
            {t("dashboard:abuseReport.deletedUser")}
          </Typography>
        );
      }
    }
  }, [abuseReport, shareClicked, t]);

  return (
    <TableRow hover key={abuseReport?.id} selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox
          disabled={deleting}
          size="small"
          disableRipple
          color="primary"
          onClick={onSelectClick}
          checked={selected}
        />
      </TableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{abuseReport?.id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>{reportTarget}</NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          {abuseReport?.file_uri && (
            <FileBadge
              simplifiedFile={{
                type: FileType.folder,
                path: abuseReport?.file_uri,
              }}
            />
          )}
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          {/* @ts-ignore */}
          {t("application:vas.reportReasonOptions", { returnObjects: true })[abuseReport?.category ?? 0]}
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>{abuseReport?.description}</NoWrapTableCell>
      <NoWrapTableCell>
        {abuseReport?.edges?.reporter && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar
              sx={{ width: 24, height: 24 }}
              overwriteTextSize
              user={{
                id: abuseReport?.reporter_hash_id ?? "",
                nickname: abuseReport?.edges?.reporter?.nick ?? "",
                created_at: abuseReport?.edges?.reporter?.created_at ?? "",
              }}
            />
            <NoWrapTypography variant="inherit">
              <Link
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onClick={userClicked}
                underline="hover"
                href="#/"
              >
                {abuseReport?.edges?.reporter?.nick}
              </Link>
            </NoWrapTypography>
          </Box>
        )}
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          <TimeBadge datetime={abuseReport?.created_at ?? ""} variant="inherit" timeAgoThreshold={0} />
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={onDeleteClick} disabled={deleteLoading || deleting}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </NoWrapTableCell>
    </TableRow>
  );
};

export default AbuseReportRow;
