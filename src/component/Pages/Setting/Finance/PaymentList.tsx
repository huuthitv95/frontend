// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Table, TableBody, TableContainer, TableHead, TableRow, Theme, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPayments } from "../../../../api/api.ts";
import { Payment, PaymentStatus, ProductType } from "../../../../api/vas.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { formatPrice } from "../../../../util";
import {
  NoWrapCell,
  NoWrapTableCell,
  SecondaryButton,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents.tsx";

export const paymentStatusTextMap: { [key: string]: string } = {
  [PaymentStatus.canceled]: "application:setting.canceled",
  [PaymentStatus.created]: "application:vas.unpaid",
  [PaymentStatus.paid]: "application:vas.paid",
  [PaymentStatus.fulfilled]: "application:setting.finished",
  [PaymentStatus.fulfill_failed]: "application:vas.fulfillFailedStatus",
};

export const paymentStatusColorMap: {
  [key: string]: (theme: Theme) => string;
} = {
  [PaymentStatus.canceled]: (t) => t.palette.action.disabled,
  [PaymentStatus.created]: (t) => t.palette.text.primary,
  [PaymentStatus.paid]: (t) => t.palette.success.light,
  [PaymentStatus.fulfilled]: (t) => t.palette.success.main,
  [PaymentStatus.fulfill_failed]: (t) => t.palette.error.main,
};

export const productTypeMap: { [key: number]: string } = {
  [ProductType.share_link]: "application:modals.shareLink",
  [ProductType.group]: "application:setting.group",
  [ProductType.storage]: "application:vas.extendStorage",
  [ProductType.points]: "application:vas.points",
};

const PaymentList = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [nextPageToken, setNextPageToken] = useState<string | undefined>("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNextPage = useCallback(
    (originPayments: Payment[], token?: string) => () => {
      setLoading(true);
      dispatch(
        getPayments({
          page_size: 10,
          next_page_token: token,
          order_direction: "desc",
        }),
      )
        .then((res) => {
          setPayments([...originPayments, ...res.payments]);
          if (res.pagination?.next_token) {
            setNextPageToken(res.pagination.next_token);
          } else {
            setNextPageToken(undefined);
          }
        })
        .catch(() => {
          setNextPageToken(undefined);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [dispatch],
  );

  const refresh = () => {
    loadNextPage([], "")();
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <TableContainer sx={{ mt: 1 }} component={StyledTableContainerPaper}>
      <Table sx={{ width: "100%", tableLayout: "fixed" }} size="small">
        <TableHead>
          <TableRow>
            <NoWrapTableCell width={150}>{t("vas.tradeNo")}</NoWrapTableCell>
            <NoWrapTableCell width={150}>{t("fileManager.name")}</NoWrapTableCell>
            <NoWrapTableCell width={100}>{t("vas.amount")}</NoWrapTableCell>
            <NoWrapTableCell width={100}>{t("share.price")}</NoWrapTableCell>
            <NoWrapTableCell width={100}>{t("setting.taskStatus")}</NoWrapTableCell>
            <NoWrapTableCell width={100}>{t("vas.productType")}</NoWrapTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((l) => (
            <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} hover>
              <NoWrapCell component="th" scope="row">
                {l.trade_no}
              </NoWrapCell>
              <NoWrapCell>{l.name}</NoWrapCell>
              <NoWrapCell>
                {l.price_mark && l.price_one_unit
                  ? formatPrice(l.price_mark, (l.price_unit ?? 0) * l.qyt, l.price_one_unit)
                  : t("vas.creditsTotalNum", {
                      num: l.qyt * (l.price_unit ?? 0),
                    })}
              </NoWrapCell>
              <NoWrapCell>
                {l.price_mark && l.price_one_unit
                  ? formatPrice(l.price_mark, l.price_unit ?? 0, l.price_one_unit)
                  : t("vas.creditsTotalNum", {
                      num: l.price_unit ?? 0,
                    })}{" "}
                x {l.qyt}
              </NoWrapCell>
              <NoWrapCell
                sx={{
                  color: paymentStatusColorMap[l.status ?? ""],
                }}
              >
                {t(paymentStatusTextMap[l.status ?? ""])}
              </NoWrapCell>
              <NoWrapCell>{t(productTypeMap[l.product_type ?? 0])}</NoWrapCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {nextPageToken != undefined && (
        <Box sx={{ p: 1, width: "100%", textAlign: "center" }}>
          <SecondaryButton onClick={loadNextPage(payments, nextPageToken)} disabled={loading} fullWidth>
            {t("download.loadMore")}
          </SecondaryButton>
        </Box>
      )}
      {nextPageToken == undefined && payments.length == 0 && (
        <Box sx={{ p: 1, width: "100%", textAlign: "center" }}>
          <Typography variant={"caption"} color={"text.secondary"}>
            {t("application:setting.listEmpty")}
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default PaymentList;
