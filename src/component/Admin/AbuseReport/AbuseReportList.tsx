// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Delete } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { batchDeleteAbuseReports, getAbuseReportList } from "../../../api/api";
import { AbuseReport } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../Common/StyledComponents";
import ArrowSync from "../../Icons/ArrowSync";
import Filter from "../../Icons/Filter";
import PageContainer from "../../Pages/PageContainer";
import PageHeader from "../../Pages/PageHeader";
import TablePagination from "../Common/TablePagination";
import ShareDialog from "../Share/ShareDialog/ShareDialog";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../StoragePolicy/StoragePolicySetting";
import UserDialog from "../User/UserDialog/UserDialog";
import AbuseReportFilterPopover from "./AbuseReportFilterPopover";
import AbuseReportRow from "./AbuseReportRow";

export const UserQuery = "user";
export const ReporterQuery = "reporter";
export const ShareQuery = "share";
export const FileUriQuery = "file_uri";
export const ReasonQuery = "reason";

const AbuseReportList = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [abuseReports, setAbuseReports] = useState<AbuseReport[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [user, setUser] = useQueryState(UserQuery, { defaultValue: "" });
  const [reporter, setReporter] = useQueryState(ReporterQuery, { defaultValue: "" });
  const [share, setShare] = useQueryState(ShareQuery, { defaultValue: "" });
  const [fileUri, setFileUri] = useQueryState(FileUriQuery, { defaultValue: "" });
  const [reason, setReason] = useQueryState(ReasonQuery, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "abuseReportFilterPopover",
  });

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareDialogID, setShareDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 11;

  const clearFilters = useCallback(() => {
    setUser("");
    setReporter("");
    setShare("");
    setFileUri("");
    setReason("");
  }, [setUser, setReporter, setShare, setFileUri, setReason]);

  useEffect(() => {
    fetchEvents();
  }, [page, pageSize, orderBy, orderDirection, user, reporter, share, fileUri, reason]);

  const fetchEvents = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getAbuseReportList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: {
          abuse_report_user: user,
          abuse_report_reporter: reporter,
          abuse_report_share: share,
          abuse_report_file_uri: fileUri,
          abuse_report_category: reason,
        },
      }),
    )
      .then((res) => {
        setAbuseReports(res.reports);
        setPageSize(res.pagination.page_size.toString());
        setCount(res.pagination.total_items ?? 0);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    dispatch(confirmOperation(t("abuseReport.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteAbuseReports({ ids: Array.from(selected) }))
          .then(() => {
            fetchEvents();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = abuseReports.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelect = useCallback(
    (id: number) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: readonly number[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }
      setSelected(newSelected);
    },
    [selected],
  );

  const orderById = orderBy === "id" || orderBy === "";
  const direction = orderDirection as "asc" | "desc";
  const onSortClick = (field: string) => () => {
    const alreadySorted = orderBy === field || (field === "id" && orderById);
    setOrderBy(field);
    setOrderDirection(alreadySorted ? (direction === "asc" ? "desc" : "asc") : "asc");
  };

  const hasActiveFilters = useMemo(() => {
    return !!(user || reporter || share || fileUri || reason);
  }, [user, reporter, share, fileUri, reason]);

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  const handleShareDialogOpen = (id: number) => {
    setShareDialogID(id);
    setShareDialogOpen(true);
  };

  return (
    <PageContainer>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <ShareDialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)} shareID={shareDialogID} />
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.abuseReport")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <AbuseReportFilterPopover
            {...bindPopover(filterPopupState)}
            user={user}
            setUser={setUser}
            reporter={reporter}
            setReporter={setReporter}
            share={share}
            setShare={setShare}
            fileUri={fileUri}
            setFileUri={setFileUri}
            reason={reason}
            setReason={setReason}
            clearFilters={clearFilters}
          />

          <SecondaryButton onClick={fetchEvents} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          {selected.length > 0 && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("abuseReport.deleteXAbuseReports", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        <TableContainer component={StyledTableContainerPaper} sx={{ mt: 2 }}>
          <Table size="small" stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: "36px!important" }} width={50}>
                  <Checkbox
                    size="small"
                    disableRipple
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < abuseReports.length}
                    checked={abuseReports.length > 0 && selected.length === abuseReports.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={60} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={200}>{t("application:vas.reportTarget")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("abuseReport.folderPath")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("application:vas.reportReason")}</NoWrapTableCell>
                <NoWrapTableCell width={300}>{t("application:vas.reportDescription")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("abuseReport.reporter")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>
                  <TableSortLabel
                    active={orderBy === "created_at"}
                    direction={direction}
                    onClick={onSortClick("created_at")}
                  >
                    {t("file.createdAt")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={60} align="right"></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                abuseReports.map((abuseReport) => (
                  <AbuseReportRow
                    deleting={deleteLoading}
                    key={abuseReport.id}
                    abuseReport={abuseReport}
                    onDelete={fetchEvents}
                    selected={selected.includes(abuseReport.id)}
                    onSelect={handleSelect}
                    openUserDialog={handleUserDialogOpen}
                    openShareDialog={handleShareDialogOpen}
                  />
                ))}
              {loading &&
                abuseReports.length > 0 &&
                abuseReports
                  .slice(0, 10)
                  .map((abuseReport) => <AbuseReportRow key={`loading-${abuseReport.id}`} loading={true} />)}
              {loading &&
                abuseReports.length === 0 &&
                Array.from(Array(10)).map((_, index) => <AbuseReportRow key={`loading-${index}`} loading={true} />)}
            </TableBody>
          </Table>
        </TableContainer>
        {count > 0 && (
          <Box sx={{ mt: 1 }}>
            <TablePagination
              page={pageInt}
              totalItems={count}
              rowsPerPage={pageSizeInt}
              rowsPerPageOptions={[10, 25, 50, 100, 200, 500]}
              onRowsPerPageChange={(value) => setPageSize(value.toString())}
              onChange={(_, value) => setPage(value.toString())}
            />
          </Box>
        )}
      </Container>
    </PageContainer>
  );
};

export default AbuseReportList;
