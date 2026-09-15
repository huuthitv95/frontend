// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import * as React from "react";
import { alpha, Badge, styled, ToggleButton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { StorageProduct } from "../../../api/vas.ts";
import { formatPrice, sizeToString } from "../../../util";

export interface StorageOptionProps {
  selected?: boolean;
  product: StorageProduct;
  onSelect: (product: StorageProduct) => void;
}

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  boxShadow: `0 0 0 1px ${theme.palette.divider}`,
  border: "none",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  width: "100%",
  height: "100%",
  "&.Mui-selected": {
    color: theme.palette.text.secondary,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.2),
    },
  },
  transition: theme.transitions.create(["background-color", "box-shadow"]),
}));

export const StyledBadge = styled(Badge)(() => ({
  width: "100%",
  "& .MuiBadge-badge": {
    right: 0,
    transform: "scale(1) translate(2px, -50%)",
  },
}));

const StorageOption = ({ selected, onSelect, product }: StorageOptionProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const payment = useAppSelector((state) => state.siteConfig.vas.config.payment);

  return (
    <StyledBadge badgeContent={product.chip} color="primary">
      <StyledToggleButton value="check" selected={selected} onClick={() => onSelect(product)}>
        <Typography variant={"subtitle2"} color={"text.primary"}>
          {product.name}
        </Typography>
        <Typography color={"primary"} sx={{ py: 1, fontWeight: 600 }} variant={"h5"}>
          {payment ? formatPrice(payment.currency_mark, product.price, payment.currency_unit) : "-"}
        </Typography>
        <Typography variant={"subtitle2"}>{`${sizeToString(product.size)} - ${t("vas.validDurationDays", {
          num: Math.ceil(product.time / 86400),
        })}`}</Typography>
      </StyledToggleButton>
    </StyledBadge>
  );
};

export default StorageOption;
