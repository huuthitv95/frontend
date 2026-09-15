// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
// This file is part of Cloudreve Pro edition source code, Reference ID: 1228
import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import * as React from "react";
import { useCallback, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";
import { formatPrice, uuidv4 } from "../../../../util/index.ts";
import {
  DenseFilledTextField,
  NoWrapCell,
  SecondaryButton,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents.tsx";
import DraggableDialog from "../../../Dialogs/DraggableDialog.tsx";
import Add from "../../../Icons/Add.tsx";
import ArrowDown from "../../../Icons/ArrowDown.tsx";
import Dismiss from "../../../Icons/Dismiss.tsx";
import Edit from "../../../Icons/Edit.tsx";
import SettingForm from "../../../Pages/Setting/SettingForm.tsx";
import GroupSelectionInput from "../../Common/GroupSelectionInput.tsx";
import { NoMarginHelperText } from "../Settings.tsx";

interface GroupProduct {
  id: string;
  name: string;
  group_id: number;
  time: number;
  price: number;
  chip?: string;
  points?: number;
  des?: string[];
}

interface GroupProductsProps {
  config: string;
  onChange: (config: string) => void;
  currencySymbol: string;
  currencyUnit: number;
}

const GroupProductDialog = ({
  open,
  onClose,
  onSave,
  product,
  currencySymbol,
  currencyUnit,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (product: GroupProduct) => void;
  product?: GroupProduct;
  currencySymbol: string;
  currencyUnit: number;
}) => {
  const { t } = useTranslation("dashboard");
  const [usePoints, setUsePoints] = useState(!!product?.points);
  const formRef = useRef<HTMLFormElement>(null);
  const [editProduct, setEditProduct] = useState<GroupProduct | undefined>(product);
  const [description, setDescription] = useState<string>("");

  const handleSave = () => {
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      return;
    }

    const newProduct: GroupProduct = {
      ...editProduct,
    } as GroupProduct;

    newProduct.chip = editProduct?.chip != "" ? editProduct?.chip : undefined;

    if (usePoints && editProduct?.points) {
      newProduct.points = editProduct.points;
    } else {
      newProduct.points = undefined;
    }

    // Process the description text into an array
    if (description) {
      newProduct.des = description.split("\n").filter((line) => line.trim() !== "");
    } else {
      newProduct.des = [];
    }

    onSave(newProduct);
    onClose();
  };

  React.useEffect(() => {
    if (product) {
      setEditProduct({ ...product });
      setUsePoints(!!product.points);
      setDescription(product.des ? product.des.join("\n") : "");
    }

    if (!open) {
      setTimeout(() => {
        setEditProduct(undefined);
        setUsePoints(false);
        setDescription("");
      }, 100);
    }
  }, [open, product]);

  return (
    <DraggableDialog
      title={product ? t("settings.editGroupProduct") : t("settings.addGroupProduct")}
      showActions
      showCancel
      onAccept={handleSave}
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
        {editProduct && (
          <>
            <SettingForm title={t("settings.displayName")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={editProduct?.name || ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.groupId")} lgWidth={12}>
              <FormControl fullWidth>
                <GroupSelectionInput
                  value={editProduct?.group_id?.toString() ?? "0"}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      group_id: parseInt(e),
                    })
                  }
                />
                <NoMarginHelperText>{t("settings.groupIdHelp")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.duration")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={editProduct?.time ?? 0}
                  inputProps={{
                    min: 1,
                  }}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      time: parseInt(e.target.value),
                    })
                  }
                  type="number"
                  required
                />
                <NoMarginHelperText>{t("settings.durationSeconds")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.priceInUnits")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={editProduct?.price ?? 0}
                  inputProps={{
                    min: 1,
                  }}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      price: parseInt(e.target.value),
                    })
                  }
                  type="number"
                  required
                />
                <NoMarginHelperText>
                  {`${t("settings.priceInUnitsDes")} ${formatPrice(
                    currencySymbol,
                    editProduct?.price ?? 0,
                    currencyUnit,
                  )}`}
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.chipLabel")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={editProduct?.chip ?? ""}
                  onChange={(e) =>
                    setEditProduct({
                      ...editProduct,
                      chip: e.target.value,
                    })
                  }
                />
                <NoMarginHelperText>{t("settings.chipLabelHelp")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.description")} lgWidth={12}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  multiline
                  rows={4}
                />
                <NoMarginHelperText>{t("settings.descriptionHelp")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm lgWidth={12}>
              <FormControl>
                <FormControlLabel
                  control={<Switch checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />}
                  label={t("settings.usePoints")}
                />
              </FormControl>
            </SettingForm>

            {usePoints && (
              <SettingForm title={t("settings.points")} lgWidth={12}>
                <FormControl fullWidth>
                  <DenseFilledTextField
                    value={editProduct?.points ?? 0}
                    onChange={(e) =>
                      setEditProduct({
                        ...editProduct,
                        points: parseInt(e.target.value),
                      })
                    }
                    inputProps={{
                      min: 1,
                    }}
                    type="number"
                    required={usePoints}
                  />
                  <NoMarginHelperText>{t("settings.pointsHelp")}</NoMarginHelperText>
                </FormControl>
              </SettingForm>
            )}
          </>
        )}
      </Box>
    </DraggableDialog>
  );
};

const DND_TYPE = "group-product-row";

type DragItem = { index: number };

interface DraggableProductRowProps {
  product: GroupProduct;
  index: number;
  moveRow: (from: number, to: number) => void;
  onEdit: (product: GroupProduct) => void;
  onDelete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  currencySymbol: string;
  currencyUnit: number;
  t: any;
  style?: React.CSSProperties;
}

const DraggableProductRow = React.memo(
  React.forwardRef<HTMLTableRowElement, DraggableProductRowProps>(
    (
      {
        product,
        index,
        moveRow,
        onEdit,
        onDelete,
        onMoveUp,
        onMoveDown,
        isFirst,
        isLast,
        currencySymbol,
        currencyUnit,
        t,
        style,
      },
      ref,
    ): JSX.Element => {
      const [, drop] = useDrop<DragItem>({
        accept: DND_TYPE,
        hover(item, monitor) {
          if (!(ref && typeof ref !== "function" && ref.current)) return;
          const dragIndex = item.index;
          const hoverIndex = index;
          if (dragIndex === hoverIndex) return;
          const hoverBoundingRect = ref.current.getBoundingClientRect();
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const clientOffset = monitor.getClientOffset();
          if (!clientOffset) return;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
          if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
          moveRow(dragIndex, hoverIndex);
          item.index = hoverIndex;
        },
      });
      const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
        type: DND_TYPE,
        item: { index },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      });
      const setRowRef = (node: HTMLTableRowElement | null) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTableRowElement | null>).current = node;
        }
        drag(drop(node));
      };
      return (
        <TableRow ref={setRowRef} hover style={{ opacity: isDragging ? 0.5 : 1, cursor: "move", ...style }}>
          <NoWrapCell>
            {product.name}
            {product.chip && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: "0.75rem",
                }}
              >
                {product.chip}
              </Box>
            )}
          </NoWrapCell>
          <NoWrapCell>
            {product.price > 0 && (
              <Box component="span">{formatPrice(currencySymbol, product.price, currencyUnit)}</Box>
            )}
            {product.points && (
              <Box component="span" sx={{ ml: product.price > 0 ? 1 : 0 }}>
                {product.points} {t("settings.pointsUnit")}
              </Box>
            )}
          </NoWrapCell>
          <NoWrapCell>{t("application:vas.validDurationDays", { num: Math.ceil(product.time / 86400) })}</NoWrapCell>
          <NoWrapCell>
            <Stack direction="row" flexWrap="wrap" gap={0.5}>
              {product.des &&
                product.des.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    size="small"
                    variant="outlined"
                    sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}
                  />
                ))}
            </Stack>
          </NoWrapCell>
          <NoWrapCell>
            <IconButton size="small" onClick={() => onEdit(product)}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(product.id)}>
              <Dismiss fontSize="small" />
            </IconButton>
          </NoWrapCell>
          <NoWrapCell>
            <IconButton size="small" onClick={onMoveUp} disabled={isFirst}>
              <ArrowDown
                sx={{
                  width: "18px",
                  height: "18px",
                  transform: "rotate(180deg)",
                }}
              />
            </IconButton>
            <IconButton size="small" onClick={onMoveDown} disabled={isLast}>
              <ArrowDown
                sx={{
                  width: "18px",
                  height: "18px",
                }}
              />
            </IconButton>
          </NoWrapCell>
        </TableRow>
      );
    },
  ),
);

const GroupProducts = ({ config, onChange, currencySymbol, currencyUnit }: GroupProductsProps) => {
  const { t } = useTranslation("dashboard");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<GroupProduct | undefined>(undefined);
  const [products, setProducts] = useState<GroupProduct[]>([]);

  React.useEffect(() => {
    try {
      setProducts(JSON.parse(config || "[]"));
    } catch {
      setProducts([]);
    }
  }, [config]);

  const handleDeleteProduct = useCallback(
    (id: string) => {
      const newProducts = products.filter((p) => p.id !== id);
      setProducts(newProducts);
      onChange(JSON.stringify(newProducts));
    },
    [products, onChange],
  );

  const handleEditProduct = useCallback(
    (product: GroupProduct) => {
      setEditProduct(product);
      setDialogOpen(true);
    },
    [setEditProduct, setDialogOpen],
  );

  const handleAddProduct = useCallback(() => {
    const newProduct: GroupProduct = {
      id: uuidv4(),
      name: "",
      group_id: 1,
      time: 0,
      price: 0,
      chip: "",
      des: [],
    };
    setEditProduct(newProduct);
    setDialogOpen(true);
  }, [setEditProduct, setDialogOpen]);

  const handleSaveProduct = useCallback(
    (product: GroupProduct) => {
      const existingIndex = products.findIndex((p) => p.id === product.id);
      let newProducts: GroupProduct[];
      if (existingIndex >= 0) {
        newProducts = [...products];
        newProducts[existingIndex] = product;
      } else {
        newProducts = [...products, product];
      }
      setProducts(newProducts);
      onChange(JSON.stringify(newProducts));
    },
    [products, onChange],
  );

  // 拖拽排序逻辑
  const moveRow = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const updated = [...products];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      setProducts(updated);
      onChange(JSON.stringify(updated));
    },
    [products, onChange],
  );

  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return;
    moveRow(idx, idx - 1);
  };
  const handleMoveDown = (idx: number) => {
    if (idx >= products.length - 1) return;
    moveRow(idx, idx + 1);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <SecondaryButton variant="contained" startIcon={<Add />} onClick={handleAddProduct}>
          {t("settings.addGroupProduct")}
        </SecondaryButton>
      </Box>
      <TableContainer component={StyledTableContainerPaper}>
        <DndProvider backend={HTML5Backend}>
          <Table sx={{ width: "100%" }} size="small">
            <TableHead>
              <TableRow>
                <NoWrapCell>{t("settings.displayName")}</NoWrapCell>
                <NoWrapCell>{t("settings.price")}</NoWrapCell>
                <NoWrapCell>{t("settings.duration")}</NoWrapCell>
                <NoWrapCell>{t("settings.description")}</NoWrapCell>
                <NoWrapCell>{t("settings.actions")}</NoWrapCell>
                <NoWrapCell></NoWrapCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product, idx) => {
                const rowRef = React.createRef<HTMLTableRowElement>();
                return (
                  <DraggableProductRow
                    key={product.id}
                    ref={rowRef}
                    product={product}
                    index={idx}
                    moveRow={moveRow}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onMoveUp={() => handleMoveUp(idx)}
                    onMoveDown={() => handleMoveDown(idx)}
                    isFirst={idx === 0}
                    isLast={idx === products.length - 1}
                    currencySymbol={currencySymbol}
                    currencyUnit={currencyUnit}
                    t={t}
                  />
                );
              })}
              {products.length === 0 && (
                <TableRow>
                  <NoWrapCell colSpan={6} align="center">
                    <Typography variant="caption" color="text.secondary">
                      {t("application:setting.listEmpty")}
                    </Typography>
                  </NoWrapCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndProvider>
      </TableContainer>
      <GroupProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveProduct}
        product={editProduct}
        currencySymbol={currencySymbol}
        currencyUnit={currencyUnit}
      />
    </Box>
  );
};

export default GroupProducts;
