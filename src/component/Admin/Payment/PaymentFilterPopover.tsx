// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Button, ListItemText, Popover, PopoverProps, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductType } from "../../../api/vas";
import { useAppSelector } from "../../../redux/hooks";
import { DenseFilledTextField, DenseSelect } from "../../Common/StyledComponents";
import { SquareMenuItem } from "../../FileManager/ContextMenu/ContextMenu";
import { paymentStatusTextMap, productTypeMap } from "../../Pages/Setting/Finance/PaymentList";
import SettingForm from "../../Pages/Setting/SettingForm";

export interface PaymentFilterPopoverProps extends PopoverProps {
  user: string;
  setUser: (user: string) => void;
  tradeNo: string;
  setTradeNo: (tradeNo: string) => void;
  productType: string;
  setProductType: (productType: string) => void;
  providerID: string;
  setProviderID: (providerID: string) => void;
  status: string;
  setStatus: (status: string) => void;
  clearFilters: () => void;
}

const PaymentFilterPopover = ({
  user,
  setUser,
  tradeNo,
  setTradeNo,
  productType,
  setProductType,
  providerID,
  setProviderID,
  status,
  setStatus,
  clearFilters,
  onClose,
  open,
  ...rest
}: PaymentFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");
  const paymentProviders = useAppSelector((state) => state.siteConfig.vas.config?.payment?.providers);

  // Create local state to track changes before applying
  const [localUser, setLocalUser] = useState(user);
  const [localTradeNo, setLocalTradeNo] = useState(tradeNo);
  const [localProductType, setLocalProductType] = useState(productType);
  const [localProviderID, setLocalProviderID] = useState(providerID);
  const [localStatus, setLocalStatus] = useState(status);

  // Initialize local state when popup opens
  useEffect(() => {
    if (open) {
      setLocalUser(user);
      setLocalTradeNo(tradeNo);
      setLocalProductType(productType);
      setLocalProviderID(providerID);
      setLocalStatus(status);
    }
  }, [open]);

  // Apply filters and close popover
  const handleApplyFilters = () => {
    setUser(localUser);
    setTradeNo(localTradeNo);
    setProductType(localProductType);
    setProviderID(localProviderID);
    setStatus(localStatus);
    onClose?.({}, "backdropClick");
  };

  // Reset filters and close popover
  const handleResetFilters = () => {
    setLocalUser("");
    setLocalTradeNo("");
    setLocalProductType("");
    setLocalProviderID("");
    setLocalStatus("");
    clearFilters();
    onClose?.({}, "backdropClick");
  };

  return (
    <Popover
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            p: 2,
            width: 300,
            maxWidth: "100%",
          },
        },
      }}
      onClose={onClose}
      open={open}
      {...rest}
    >
      <Stack spacing={2}>
        <SettingForm title={t("event.userID")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localUser}
            onChange={(e) => setLocalUser(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("payment.tradeNo")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localTradeNo}
            onChange={(e) => setLocalTradeNo(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("payment.status")} noContainer lgWidth={12}>
          <DenseSelect
            fullWidth
            displayEmpty
            value={localStatus == "" ? " " : localStatus}
            onChange={(e) => setLocalStatus(e.target.value === " " ? "" : (e.target.value as string))}
          >
            {Object.keys(paymentStatusTextMap).map((status) => (
              <SquareMenuItem key={status} value={status}>
                <ListItemText
                  primary={t(paymentStatusTextMap[status])}
                  slotProps={{
                    primary: {
                      variant: "body2",
                    },
                  }}
                />
              </SquareMenuItem>
            ))}
            <SquareMenuItem value={" "}>
              <ListItemText
                primary={<em>{t("user.all")}</em>}
                slotProps={{
                  primary: {
                    variant: "body2",
                  },
                }}
              />
            </SquareMenuItem>
          </DenseSelect>
        </SettingForm>

        <SettingForm title={t("payment.productType")} noContainer lgWidth={12}>
          <DenseSelect
            fullWidth
            displayEmpty
            value={localProductType == "" ? " " : localProductType}
            onChange={(e) => setLocalProductType(e.target.value === " " ? "" : (e.target.value as string))}
          >
            {[ProductType.share_link, ProductType.group, ProductType.storage, ProductType.points].map(
              (type: number) => (
                <SquareMenuItem key={type} value={type.toString()}>
                  <ListItemText
                    primary={t(productTypeMap[type])}
                    slotProps={{
                      primary: {
                        variant: "body2",
                      },
                    }}
                  />
                </SquareMenuItem>
              ),
            )}
            <SquareMenuItem value={" "}>
              <ListItemText
                primary={<em>{t("user.all")}</em>}
                slotProps={{
                  primary: {
                    variant: "body2",
                  },
                }}
              />
            </SquareMenuItem>
          </DenseSelect>
        </SettingForm>

        <SettingForm title={t("payment.providerID")} noContainer lgWidth={12}>
          <DenseSelect
            fullWidth
            displayEmpty
            value={localProviderID == "" ? " " : localProviderID}
            onChange={(e) => setLocalProviderID(e.target.value === " " ? "" : (e.target.value as string))}
          >
            {paymentProviders?.map((provider) => (
              <SquareMenuItem key={provider.id} value={provider.id}>
                <ListItemText
                  primary={provider.name}
                  slotProps={{
                    primary: {
                      variant: "body2",
                    },
                  }}
                />
              </SquareMenuItem>
            ))}
            <SquareMenuItem value={" "}>
              <ListItemText
                primary={<em>{t("user.all")}</em>}
                slotProps={{
                  primary: {
                    variant: "body2",
                  },
                }}
              />
            </SquareMenuItem>
          </DenseSelect>
        </SettingForm>

        <Box display="flex" justifyContent="space-between">
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            {t("user.reset")}
          </Button>
          <Button variant="contained" size="small" onClick={handleApplyFilters}>
            {t("user.apply")}
          </Button>
        </Box>
      </Stack>
    </Popover>
  );
};

export default PaymentFilterPopover;
