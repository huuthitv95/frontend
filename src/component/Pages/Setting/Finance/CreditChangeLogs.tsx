// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Table, TableBody, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCreditChangeLogs } from "../../../../api/api.ts";
import { CreditChangeLog } from "../../../../api/user.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import {
  NoWrapCell,
  NoWrapTableCell,
  SecondaryButton,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents.tsx";
import TimeBadge from "../../../Common/TimeBadge.tsx";

const creditChangeReasonMap: { [key: string]: string } = {
  pay: "creditReasonSharePay",
  recharge: "creditReasonRecharge",
  share_purchased: "creditReasonShareGain",
  adjust: "creditReasonAdjust",
};

const CreditChangeLogs = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [nextPageToken, setNextPageToken] = useState<string | undefined>("");
  const [logs, setLogs] = useState<CreditChangeLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNextPage = useCallback(
    (originLogs: CreditChangeLog[], token?: string) => () => {
      setLoading(true);
      dispatch(
        getCreditChangeLogs({
          page_size: 10,
          next_page_token: token,
          order_direction: "desc",
        }),
      )
        .then((res) => {
          setLogs([...originLogs, ...res.changes]);
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
            <NoWrapTableCell width={100}>{t("setting.change")}</NoWrapTableCell>
            <NoWrapTableCell width={200}>{t("setting.time")}</NoWrapTableCell>
            <NoWrapTableCell width={200}>{t("setting.reason")}</NoWrapTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((l) => (
            <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }} hover>
              <NoWrapCell
                component="th"
                scope="row"
                sx={{
                  color: (theme) => (l.diff > 0 ? theme.palette.success.dark : theme.palette.warning.dark),
                }}
              >
                {`${l.diff > 0 ? "+" : "−"}${Math.abs(l.diff)}`}
              </NoWrapCell>
              <NoWrapCell component="th" scope="row">
                <TimeBadge datetime={l.changed_at} variant={"inherit"} />
              </NoWrapCell>
              <NoWrapCell component="th" scope="row">
                {l.reason ? t(`vas.${creditChangeReasonMap[l.reason]}`) : ""}
              </NoWrapCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {nextPageToken != undefined && (
        <Box sx={{ p: 1, width: "100%", textAlign: "center" }}>
          <SecondaryButton onClick={loadNextPage(logs, nextPageToken)} disabled={loading} fullWidth>
            {t("download.loadMore")}
          </SecondaryButton>
        </Box>
      )}
      {nextPageToken == undefined && logs.length == 0 && (
        <Box sx={{ p: 1, width: "100%", textAlign: "center" }}>
          <Typography variant={"caption"} color={"text.secondary"}>
            {t("application:setting.listEmpty")}
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default CreditChangeLogs;
