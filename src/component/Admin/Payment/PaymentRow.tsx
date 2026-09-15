// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Checkbox, IconButton, Link, Skeleton, TableCell, TableRow } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { batchDeletePayments } from "../../../api/api";
import { Payment } from "../../../api/dashboard";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { formatPrice } from "../../../util";
import { NoWrapTableCell, NoWrapTypography } from "../../Common/StyledComponents";
import TimeBadge from "../../Common/TimeBadge";
import UserAvatar from "../../Common/User/UserAvatar";
import Delete from "../../Icons/Delete";
import { paymentStatusColorMap, paymentStatusTextMap, productTypeMap } from "../../Pages/Setting/Finance/PaymentList";

export interface PaymentRowProps {
  payment?: Payment;
  loading?: boolean;
  deleting?: boolean;
  selected?: boolean;
  onDelete?: () => void;
  onDetails?: (id: number) => void;
  onSelect?: (id: number) => void;
  openUserDialog?: (id: number) => void;
}

const PaymentRow = ({
  payment,
  loading,
  deleting,
  selected,
  onDelete,
  onDetails,
  onSelect,
  openUserDialog,
}: PaymentRowProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const paymentProviders = useAppSelector((state) => state.siteConfig.vas.config?.payment?.providers);
  const onRowClick = () => {
    onDetails?.(payment?.id ?? 0);
  };

  const onDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("vas.confirmDelete"))).then(() => {
      if (payment?.id) {
        setDeleteLoading(true);
        dispatch(batchDeletePayments({ ids: [payment.id] }))
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
    onSelect?.(payment?.id ?? 0);
  };

  const provider = useMemo(() => {
    return paymentProviders?.find((p) => p.id === payment?.provider_id);
  }, [paymentProviders, payment]);

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={200} />
          </Box>
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width={50} />
          </Box>
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={70} />
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
    openUserDialog?.(payment?.edges?.user?.id ?? 0);
  };

  return (
    <TableRow hover key={payment?.id} onClick={onRowClick} selected={selected}>
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
        <NoWrapTypography variant="inherit">{payment?.id}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{payment?.name}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{t(productTypeMap[payment?.product_type ?? 0])}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{payment?.trade_no}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">
          {payment?.price_mark && payment?.price_one_unit
            ? formatPrice(payment?.price_mark, payment?.price_unit ?? 0, payment?.price_one_unit)
            : t("application:vas.creditsTotalNum", {
                num: payment?.price_unit ?? 0,
              })}{" "}
          x {payment?.qyt}
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell sx={{ color: paymentStatusColorMap[payment?.status ?? ""] }}>
        <NoWrapTypography variant="inherit">{t(paymentStatusTextMap[payment?.status ?? ""])}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit">{provider?.name}</NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        {payment?.edges?.user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <UserAvatar
              sx={{ width: 24, height: 24 }}
              overwriteTextSize
              user={{
                id: payment?.user_hash_id ?? "",
                nickname: payment?.edges?.user?.nick ?? "",
                created_at: payment?.edges?.user?.created_at ?? "",
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
                {payment?.edges?.user?.nick}
              </Link>
            </NoWrapTypography>
          </Box>
        )}
      </NoWrapTableCell>
      <NoWrapTableCell>
        <TimeBadge datetime={payment?.created_at ?? ""} variant="inherit" timeAgoThreshold={0} />
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

export default PaymentRow;
