// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  Link,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { createGiftCode, deleteGiftCode, getGiftCodeList } from "../../../../api/api.ts";
import { AdminListService, User } from "../../../../api/dashboard.ts";
import {
  GroupSku as GroupProduct,
  ProductParameter,
  ProductType,
  StorageProduct,
  GiftCode as VasGiftCode,
} from "../../../../api/vas.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import {
  DenseFilledTextField,
  DenseSelect,
  NoWrapCell,
  NoWrapTypography,
  SecondaryButton,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents.tsx";
import UserAvatar from "../../../Common/User/UserAvatar.tsx";
import DraggableDialog from "../../../Dialogs/DraggableDialog.tsx";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu.tsx";
import Add from "../../../Icons/Add.tsx";
import Dismiss from "../../../Icons/Dismiss.tsx";
import SettingForm from "../../../Pages/Setting/SettingForm.tsx";
import TablePagination from "../../Common/TablePagination.tsx";
import UserDialog from "../../User/UserDialog/UserDialog.tsx";
import { NoMarginHelperText } from "../Settings.tsx";

interface GiftCodesProps {
  storageProductsConfig: string;
  groupProductsConfig: string;
}

// Simplified GiftCode interface for our component use
interface GiftCode {
  id: number;
  code: string;
  used: boolean;
  qyt: number;
  product_props: ProductParameter;
  edges: {
    user: User;
  };
  user_hash_id?: string;
}

// Pagination params
interface PaginationParams {
  page: number;
  perPage: number;
  total: number;
}

const GiftCodeStatusChip = ({ used }: { used: boolean }) => {
  const { t } = useTranslation("dashboard");

  return (
    <Chip
      color={used ? "default" : "success"}
      label={used ? t("giftCodes.giftCodeUsed") : t("giftCodes.giftCodeUnused")}
      size="small"
    />
  );
};

const GenerateGiftCodeDialog = ({
  open,
  onClose,
  storageProducts,
  groupProducts,
}: {
  open: boolean;
  onClose: () => void;
  storageProducts: StorageProduct[];
  groupProducts: GroupProduct[];
}) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const [type, setType] = useState<"storage" | "group" | "points">("points");
  const [productId, setProductId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [num, setNum] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [codes, setCodes] = useState<VasGiftCode[]>([]);
  const [openGeneratedCodesDialog, setOpenGeneratedCodesDialog] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setType("points");
        setProductId("");
        setAmount(0);
        setNum(1);
      }, 100);
    }
  }, [open]);

  // Update productId when type changes
  useEffect(() => {
    // Clear product selection when type changes
    setProductId("");

    // Set amount to 0 unless points type
    if (type !== "points") {
      setAmount(0);
    }
  }, [type]);

  const handleSubmit = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    // Convert to the API expected format
    const product: ProductParameter = {
      type: type === "points" ? ProductType.points : type === "storage" ? ProductType.storage : ProductType.group,
      sku_id: type !== "points" ? productId : undefined,
    };

    setLoading(true);
    dispatch(
      createGiftCode({
        num,
        product,
        qyt: amount,
      }),
    )
      .then((res) => {
        setCodes(res);
        setOpenGeneratedCodesDialog(true);
      })
      .finally(() => {
        setLoading(false);
      });
    onClose();
  };

  return (
    <>
      <DraggableDialog
        title={t("giftCodes.generateGiftCodes")}
        showActions
        showCancel
        loading={loading}
        onAccept={handleSubmit}
        dialogProps={{
          open,
          onClose,
          fullWidth: true,
          maxWidth: "sm",
        }}
      >
        <Box
          component={"form"}
          ref={formRef}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, px: 3, pb: 2 }}
        >
          <SettingForm title={t("giftCodes.giftCodeQuantity")} lgWidth={12}>
            <FormControl fullWidth>
              <DenseFilledTextField
                value={num}
                onChange={(e) => setNum(parseInt(e.target.value) || 1)}
                type="number"
                inputProps={{ min: 1 }}
                required
              />
              <NoMarginHelperText>{t("giftCodes.giftCodeQuantityHelp")}</NoMarginHelperText>
            </FormControl>
          </SettingForm>

          <SettingForm title={t("giftCodes.giftCodeProductType")} lgWidth={12}>
            <FormControl fullWidth>
              <DenseSelect value={type} onChange={(e) => setType(e.target.value as "storage" | "group" | "points")}>
                <SquareMenuItem value="points">
                  <ListItemText
                    slotProps={{
                      primary: { variant: "body2" },
                    }}
                  >
                    {t("giftCodes.giftCodeTypePoints")}
                  </ListItemText>
                </SquareMenuItem>
                {storageProducts.length > 0 && (
                  <SquareMenuItem value="storage">
                    <ListItemText
                      slotProps={{
                        primary: { variant: "body2" },
                      }}
                    >
                      {t("giftCodes.giftCodeTypeStorage")}
                    </ListItemText>
                  </SquareMenuItem>
                )}
                {groupProducts.length > 0 && (
                  <SquareMenuItem value="group">
                    <ListItemText
                      slotProps={{
                        primary: { variant: "body2" },
                      }}
                    >
                      {t("giftCodes.giftCodeTypeGroup")}
                    </ListItemText>
                  </SquareMenuItem>
                )}
              </DenseSelect>
            </FormControl>
          </SettingForm>

          {type === "points" && (
            <SettingForm title={t("giftCodes.giftCodePointsAmount")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  type="number"
                  inputProps={{ min: 1 }}
                  required
                />
                <NoMarginHelperText>{t("giftCodes.giftCodePointsAmountHelp")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          )}

          {type === "storage" && storageProducts.length > 0 && (
            <SettingForm title={t("giftCodes.giftCodeProduct")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseSelect value={productId} onChange={(e) => setProductId(e.target.value as string)} required>
                  {storageProducts.map((product) => (
                    <SquareMenuItem key={product.id} value={product.id}>
                      <ListItemText
                        slotProps={{
                          primary: { variant: "body2" },
                        }}
                      >
                        {product.name}
                      </ListItemText>
                    </SquareMenuItem>
                  ))}
                </DenseSelect>
              </FormControl>
            </SettingForm>
          )}

          {type === "group" && groupProducts.length > 0 && (
            <SettingForm title={t("giftCodes.giftCodeProduct")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseSelect value={productId} onChange={(e) => setProductId(e.target.value as string)} required>
                  {groupProducts.map((product) => (
                    <SquareMenuItem key={product.id} value={product.id}>
                      <ListItemText
                        slotProps={{
                          primary: { variant: "body2" },
                        }}
                      >
                        {product.name}
                      </ListItemText>
                    </SquareMenuItem>
                  ))}
                </DenseSelect>
              </FormControl>
            </SettingForm>
          )}

          {type !== "points" && (
            <SettingForm title={t("giftCodes.duratonTimes")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                  type="number"
                  inputProps={{ min: 1 }}
                  required
                />
                <NoMarginHelperText>{t("giftCodes.duratonTimesDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          )}
        </Box>
      </DraggableDialog>
      <GeneratedCodesDialog
        open={openGeneratedCodesDialog}
        onClose={() => setOpenGeneratedCodesDialog(false)}
        codes={codes}
      />
    </>
  );
};

// Add a component to display generated codes
const GeneratedCodesDialog = ({
  open,
  onClose,
  codes,
}: {
  open: boolean;
  onClose: () => void;
  codes: VasGiftCode[];
}) => {
  const { t } = useTranslation("dashboard");
  const codesText = useMemo(() => {
    return codes.map((code) => code.code).join("\n");
  }, [codes]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(codesText);
    onClose();
  };

  return (
    <DraggableDialog
      title={t("giftCodes.generatedCodesTitle")}
      showActions
      onAccept={onClose}
      dialogProps={{
        open,
        onClose,
        fullWidth: true,
        maxWidth: "md",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t("giftCodes.generatedCodesDescription")}
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={10}
          value={codesText}
          slotProps={{
            input: {
              readOnly: true,
              sx: {
                fontFamily: "monospace",
              },
            },
          }}
        />
      </Box>
    </DraggableDialog>
  );
};

const GiftCodes = ({ storageProductsConfig, groupProductsConfig }: GiftCodesProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [giftCodes, setGiftCodes] = useState<GiftCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogID, setUserDialogID] = useState<number | undefined>(undefined);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    perPage: 10,
    total: 0,
  });

  const storageProducts = useMemo(() => {
    try {
      return JSON.parse(storageProductsConfig) as StorageProduct[];
    } catch (e) {
      return [] as StorageProduct[];
    }
  }, [storageProductsConfig]);

  const groupProducts = useMemo(() => {
    try {
      return JSON.parse(groupProductsConfig) as GroupProduct[];
    } catch (e) {
      return [] as GroupProduct[];
    }
  }, [groupProductsConfig]);

  const fetchGiftCodes = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminListService = {
        page: pagination.page, // API uses 1-based pagination
        page_size: pagination.perPage,
        order_by: "id",
        order_direction: "desc",
        conditions: {},
        searches: {},
      };

      const response = await dispatch(getGiftCodeList(params));
      setGiftCodes(response.gift_codes);
      setPagination({
        page: response.pagination.page + 1,
        perPage: response.pagination.page_size,
        total: response.pagination.total_items ?? 0,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [dispatch, pagination.page, pagination.perPage, enqueueSnackbar, t]);

  const handleDeleteGiftCode = async (id: number) => {
    try {
      const response = await dispatch(deleteGiftCode({ id }));
      fetchGiftCodes();
    } catch (error) {}
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (pageSize: number) => {
    setPagination({
      page: 1,
      perPage: pageSize,
      total: pagination.total,
    });
  };

  const handleUserDialogOpen = (id: number) => {
    setUserDialogID(id);
    setUserDialogOpen(true);
  };

  // Get product name based on product type and ID
  const getProductName = useCallback(
    (productProps: ProductParameter): string => {
      if (productProps.type === ProductType.points) {
        return t("giftCodes.giftCodeTypePoints");
      } else if (productProps.type === ProductType.storage && productProps.sku_id) {
        const product = storageProducts.find((p) => p.id === productProps.sku_id);
        return product ? product.name : t("giftCodes.unknownProduct");
      } else if (productProps.type === ProductType.group && productProps.sku_id) {
        const product = groupProducts.find((p) => p.id === productProps.sku_id);
        return product ? product.name : t("giftCodes.unknownProduct");
      }
      return t("giftCodes.unknownProduct");
    },
    [storageProducts, groupProducts, t],
  );

  // Fetch gift codes on component mount and when pagination changes
  useEffect(() => {
    fetchGiftCodes();
  }, [fetchGiftCodes]);

  return (
    <Stack spacing={2}>
      <UserDialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} userID={userDialogID} />
      <Box>
        <SecondaryButton variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
          {t("giftCodes.generateGiftCodes")}
        </SecondaryButton>
      </Box>

      <StyledTableContainerPaper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <NoWrapCell>#</NoWrapCell>
                <NoWrapCell>{t("giftCodes.giftCodeProduct")}</NoWrapCell>
                <NoWrapCell>{t("giftCodes.giftCodeAmount")}</NoWrapCell>
                <NoWrapCell>{t("giftCodes.giftCode")}</NoWrapCell>
                <NoWrapCell>{t("giftCodes.giftCodeStatus")}</NoWrapCell>
                <NoWrapCell>{t("giftCodes.giftCodeUsedBy")}</NoWrapCell>
                <NoWrapCell align="right"></NoWrapCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {giftCodes.map((giftCode) => (
                <TableRow key={giftCode.id}>
                  <NoWrapCell>{giftCode.id}</NoWrapCell>
                  <NoWrapCell>{getProductName(giftCode.product_props)}</NoWrapCell>
                  <NoWrapCell>{giftCode.qyt}</NoWrapCell>
                  <NoWrapCell>{giftCode.code}</NoWrapCell>
                  <NoWrapCell>
                    <GiftCodeStatusChip used={giftCode.used} />
                  </NoWrapCell>
                  <NoWrapCell>
                    {giftCode?.edges?.user && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <UserAvatar
                          sx={{ width: 24, height: 24 }}
                          overwriteTextSize
                          user={{
                            id: giftCode?.user_hash_id ?? "",
                            nickname: giftCode?.edges?.user?.nick ?? "",
                            created_at: giftCode?.edges?.user?.created_at ?? "",
                          }}
                        />
                        <NoWrapTypography variant="inherit">
                          <Link
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                            }}
                            onClick={() => handleUserDialogOpen(giftCode.edges.user.id)}
                            underline="hover"
                          >
                            {giftCode?.edges?.user?.nick}
                          </Link>
                        </NoWrapTypography>
                      </Box>
                    )}
                  </NoWrapCell>
                  <NoWrapCell align="right">
                    <IconButton size="small" onClick={() => handleDeleteGiftCode(giftCode.id)} disabled={giftCode.used}>
                      <Dismiss fontSize="small" />
                    </IconButton>
                  </NoWrapCell>
                </TableRow>
              ))}
              {giftCodes.length === 0 && !loading && (
                <TableRow>
                  <NoWrapCell colSpan={6} align="center">
                    {t("giftCodes.noGiftCodes")}
                  </NoWrapCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination?.total > 0 && (
          <Box sx={{ px: 1 }}>
            <TablePagination
              totalItems={pagination.total}
              page={pagination.page}
              rowsPerPage={pagination.perPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onRowsPerPageChange={handleChangeRowsPerPage}
              onChange={(_, page) => setPagination({ ...pagination, page })}
            />
          </Box>
        )}
      </StyledTableContainerPaper>

      <GenerateGiftCodeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        storageProducts={storageProducts}
        groupProducts={groupProducts}
      />
    </Stack>
  );
};

export default GiftCodes;
