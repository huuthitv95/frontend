// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Checkbox, IconButton, Link, Skeleton, TableCell, TableRow } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { batchDeleteAuditLogs } from "../../../api/api";
import { AuditLog } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { NoWrapTableCell, NoWrapTypography } from "../../Common/StyledComponents";
import TimeBadge from "../../Common/TimeBadge";
import UserAvatar from "../../Common/User/UserAvatar";
import Delete from "../../Icons/Delete";
import { EventContent } from "./EventContent";

export interface EventRowProps {
  event?: AuditLog;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onDetails?: (id: number) => void;
  onSelect?: (id: number) => void;
  openUserDialog?: (id: number) => void;
  openEntityDialog?: (id: number) => void;
}

const EventRow = ({
  event,
  loading,
  deleting,
  selected,
  onDelete,
  onDetails,
  onSelect,
  openUserDialog,
  openEntityDialog,
}: EventRowProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const onRowClick = () => {
    onDetails?.(event?.id ?? 0);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("event.confirmDelete"))).then(() => {
      if (event?.id) {
        setDeleteLoading(true);
        dispatch(batchDeleteAuditLogs({ ids: [event.id] }))
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
    onSelect?.(event?.id ?? 0);
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
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
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
    openUserDialog?.(event?.edges?.user?.id ?? 0);
  };

  return (
    <TableRow hover key={event?.id} sx={{ cursor: "pointer" }} onClick={onRowClick} selected={selected}>
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
        <NoWrapTypography variant="inherit">{event?.id}</NoWrapTypography>
      </NoWrapTableCell>
      <TableCell>{event && <EventContent event={event} openEntityDialog={openEntityDialog} />}</TableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{event?.ip}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{event?.correlation_id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        {event?.edges?.user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar
              sx={{ width: 24, height: 24 }}
              overwriteTextSize
              user={{
                id: event?.user_hash_id ?? "",
                nickname: event?.edges?.user?.nick ?? "",
                created_at: event?.edges?.user?.created_at ?? "",
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
                {event?.edges?.user?.nick}
              </Link>
            </NoWrapTypography>
          </Box>
        )}
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          <TimeBadge datetime={event?.created_at ?? ""} variant="inherit" timeAgoThreshold={0} />
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

export default EventRow;
