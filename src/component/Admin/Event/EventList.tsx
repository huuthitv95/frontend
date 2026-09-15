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
import { batchDeleteAuditLogs, getAuditLogList } from "../../../api/api";
import { AuditLog } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../Common/StyledComponents";
import ArrowSync from "../../Icons/ArrowSync";
import Broom from "../../Icons/Broom";
import Filter from "../../Icons/Filter";
import PageContainer from "../../Pages/PageContainer";
import PageHeader from "../../Pages/PageHeader";
import TablePagination from "../Common/TablePagination";
import EntityDialog from "../Entity/EntityDialog/EntityDialog";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../StoragePolicy/StoragePolicySetting";
import UserDialog from "../User/UserDialog/UserDialog";
import EventCleanupDialog from "./EventCleanupDialog";
import EventDialog from "./EventDialog/EventDialog";
import EventFilterPopover from "./EventFilterPopover";
import EventRow from "./EventRow";

export const UserQuery = "user";
export const IpQuery = "ip";
export const TypeQuery = "type";
export const CorrelationIdQuery = "correlation_id";
export const FileQuery = "file";

const EventList = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AuditLog[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [user, setUser] = useQueryState(UserQuery, { defaultValue: "" });
  const [ip, setIp] = useQueryState(IpQuery, { defaultValue: "" });
  const [type, setType] = useQueryState(TypeQuery, { defaultValue: "" });
  const [correlationId, setCorrelationId] = useQueryState(CorrelationIdQuery, { defaultValue: "" });
  const [file, setFile] = useQueryState(FileQuery, { defaultValue: "" });
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "userFilterPopover",
  });

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [entityDialogID, setEntityDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventDialogID, setEventDialogID] = useState<number | undefined>(undefined);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 11;

  const clearFilters = useCallback(() => {
    setUser("");
    setIp("");
    setType("");
    setCorrelationId("");
    setFile("");
  }, [setUser, setIp, setType, setCorrelationId, setFile]);

  useEffect(() => {
    fetchEvents();
  }, [page, pageSize, orderBy, orderDirection, user, ip, type, correlationId, file]);

  const fetchEvents = () => {
    setLoading(true);
    setSelected([]);
    dispatch(
      getAuditLogList({
        page: pageInt,
        page_size: pageSizeInt,
        order_by: orderBy ?? "",
        order_direction: orderDirection ?? "desc",
        conditions: {
          audit_log_user: user,
          audit_log_ip: ip,
          audit_log_category: type,
          audit_log_correlation_id: correlationId,
          audit_log_file: file,
        },
      }),
    )
      .then((res) => {
        setEvents(res.logs);
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
    dispatch(confirmOperation(t("event.confirmBatchDelete", { num: selected.length })))
      .then(() => {
        dispatch(batchDeleteAuditLogs({ ids: Array.from(selected) }))
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
      const newSelected = events.map((n) => n.id);
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
    return !!(user || ip || type || correlationId || file);
  }, [user, ip, type, correlationId, file]);

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  const handleOpen = (id: number) => {
    setEventDialogID(id);
    setEventDialogOpen(true);
  };

  const handleEntityDialogOpen = (id: number) => {
    setEntityDialogID(id);
    setEntityDialogOpen(true);
  };

  return (
    <PageContainer>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <EntityDialog open={entityDialogOpen} onClose={() => setEntityDialogOpen(false)} entityID={entityDialogID} />
      <EventDialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)} eventID={eventDialogID} />
      <EventCleanupDialog
        open={cleanupDialogOpen}
        onClose={() => setCleanupDialogOpen(false)}
        onCleanupComplete={fetchEvents}
      />
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:nav.events")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <EventFilterPopover
            {...bindPopover(filterPopupState)}
            user={user}
            setUser={setUser}
            ip={ip}
            setIp={setIp}
            type={type}
            setType={setType}
            correlationId={correlationId}
            setCorrelationId={setCorrelationId}
            file={file}
            setFile={setFile}
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

          <SecondaryButton startIcon={<Broom />} variant="contained" onClick={() => setCleanupDialogOpen(true)}>
            {t("event.cleanup")}
          </SecondaryButton>

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("event.deleteXEvents", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("event.deleteXEvents", { num: selected.length })}
            </Button>
          </Stack>
        )}
        <TableContainer component={StyledTableContainerPaper} sx={{ mt: 2 }}>
          <Table size="small" stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: "36px!important" }} width={50}>
                  <Checkbox
                    size="small"
                    disableRipple
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < events.length}
                    checked={events.length > 0 && selected.length === events.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={60} sortDirection={orderById ? direction : false}>
                  <TableSortLabel active={orderById} direction={direction} onClick={onSortClick("id")}>
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={300}>{t("event.event")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("event.ip")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("event.correlationId")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("event.initiator")}</NoWrapTableCell>
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
                events.map((event) => (
                  <EventRow
                    deleting={deleteLoading}
                    key={event.id}
                    event={event}
                    onDelete={fetchEvents}
                    selected={selected.includes(event.id)}
                    onSelect={handleSelect}
                    onDetails={handleOpen}
                    openUserDialog={handleUserDialogOpen}
                    openEntityDialog={handleEntityDialogOpen}
                  />
                ))}
              {loading &&
                events.length > 0 &&
                events.slice(0, 10).map((event) => <EventRow key={`loading-${event.id}`} loading={true} />)}
              {loading &&
                events.length === 0 &&
                Array.from(Array(10)).map((_, index) => <EventRow key={`loading-${index}`} loading={true} />)}
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

export default EventList;
