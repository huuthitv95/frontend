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
import { batchDeletePayments, getPaymentList } from "../../../api/api";
import { AdminListService, Payment } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { loadSiteConfig } from "../../../redux/thunks/site";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../Common/StyledComponents";
import ArrowSync from "../../Icons/ArrowSync";
import Filter from "../../Icons/Filter";
import PageContainer from "../../Pages/PageContainer";
import PageHeader from "../../Pages/PageHeader";
import TablePagination from "../Common/TablePagination";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../StoragePolicy/StoragePolicySetting";
import UserDialog from "../User/UserDialog/UserDialog";
import PaymentFilterPopover from "./PaymentFilterPopover";
import PaymentRow from "./PaymentRow";
export const UserQuery = "user";
export const TradeNoQuery = "trade_no";
export const ProductTypeQuery = "product_type";
export const ProviderIDQuery = "provider_id";
export const StatusQuery = "status";

const PaymentList = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });
  const [user, setUser] = useQueryState(UserQuery, { defaultValue: "" });
  const [tradeNo, setTradeNo] = useQueryState(TradeNoQuery, { defaultValue: "" });
  const [productType, setProductType] = useQueryState(ProductTypeQuery, { defaultValue: "" });
  const [providerID, setProviderID] = useQueryState(ProviderIDQuery, { defaultValue: "" });
  const [status, setStatus] = useQueryState(StatusQuery, { defaultValue: "" });

  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const filterPopupState = usePopupState({
    variant: "popover",
    popupId: "paymentFilterPopover",
  });

  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  useEffect(() => {
    dispatch(loadSiteConfig("vas"));
  }, []);

  const clearFilters = useCallback(() => {
    setUser("");
    setTradeNo("");
    setProductType("");
    setProviderID("");
    setStatus("");
  }, [setUser, setTradeNo, setProductType, setProviderID, setStatus]);

  useEffect(() => {
    fetchPayments();
  }, [page, pageSize, orderBy, orderDirection, user, tradeNo, productType, providerID, status]);

  const fetchPayments = () => {
    setLoading(true);
    setSelected([]);

    const params: AdminListService = {
      page: pageInt,
      page_size: pageSizeInt,
      order_by: orderBy ?? "",
      order_direction: orderDirection ?? "desc",
      conditions: {
        payment_user_id: user,
        payment_product_type: productType,
        payment_provider_id: providerID,
        payment_status: status,
        payment_trade_no: tradeNo,
      },
    };

    dispatch(getPaymentList(params))
      .then((res) => {
        setPayments(res.payments);
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
    dispatch(confirmOperation(t("vas.confirmDelete")))
      .then(() => {
        dispatch(batchDeletePayments({ ids: Array.from(selected) }))
          .then(() => {
            fetchPayments();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
        setDeleteLoading(false);
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = payments.map((n) => n.id);
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
    return !!(user || tradeNo || productType || providerID || status);
  }, [user, tradeNo, productType, providerID, status]);

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  return (
    <PageContainer>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <Container maxWidth="xl">
        <PageHeader title={t("dashboard:vas.orders")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <PaymentFilterPopover
            {...bindPopover(filterPopupState)}
            user={user}
            setUser={setUser}
            tradeNo={tradeNo}
            setTradeNo={setTradeNo}
            productType={productType}
            setProductType={setProductType}
            providerID={providerID}
            setProviderID={setProviderID}
            status={status}
            setStatus={setStatus}
            clearFilters={clearFilters}
          />

          <SecondaryButton onClick={fetchPayments} disabled={loading} variant={"contained"} startIcon={<ArrowSync />}>
            {t("node.refresh")}
          </SecondaryButton>

          <Badge color="primary" variant="dot" invisible={!hasActiveFilters}>
            <SecondaryButton startIcon={<Filter />} variant="contained" {...bindTrigger(filterPopupState)}>
              {t("user.filter")}
            </SecondaryButton>
          </Badge>

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
                {t("payment.deleteXPayments", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button startIcon={<Delete />} variant="contained" color="error" onClick={handleDelete}>
              {t("payment.deleteXPayments", { num: selected.length })}
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
                    indeterminate={selected.length > 0 && selected.length < payments.length}
                    checked={payments.length > 0 && selected.length === payments.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={80}>
                  <TableSortLabel
                    active={orderById}
                    direction={orderById ? direction : "asc"}
                    onClick={onSortClick("id")}
                  >
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={250}>{t("vas.orderName")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("vas.product")}</NoWrapTableCell>
                <NoWrapTableCell width={250}>{t("vas.orderNumber")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("vas.amount")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("vas.status")}</NoWrapTableCell>
                <NoWrapTableCell width={100}>{t("vas.paidBy")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("vas.orderOwner")}</NoWrapTableCell>
                <NoWrapTableCell width={180}>
                  <TableSortLabel
                    active={orderBy === "created_at"}
                    direction={orderBy === "created_at" ? direction : "asc"}
                    onClick={onSortClick("created_at")}
                  >
                    {t("file.createdAt")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={80}></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                payments.map((payment) => (
                  <PaymentRow
                    deleting={deleteLoading}
                    key={payment.id}
                    payment={payment}
                    onDelete={fetchPayments}
                    selected={selected.indexOf(payment.id) !== -1}
                    onSelect={handleSelect}
                    openUserDialog={handleUserDialogOpen}
                  />
                ))}
              {loading &&
                payments.length > 0 &&
                payments.slice(0, 10).map((payment) => <PaymentRow key={`loading-${payment.id}`} loading={true} />)}
              {loading &&
                payments.length === 0 &&
                Array.from(Array(10)).map((_, index) => <PaymentRow key={`loading-${index}`} loading={true} />)}
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

export default PaymentList;
