// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Button, Card, CardActions, CardContent, Divider, styled, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { GroupSku } from "../../../api/vas.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { formatPrice } from "../../../util";
import { StyledBadge } from "./StorageOption.tsx";

export interface GroupSkuOptionProps {
  sku: GroupSku;
  onSelect: (product: GroupSku) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  width: "100%",
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
}));

const GroupSkuOption = ({ onSelect, sku }: GroupSkuOptionProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const payment = useAppSelector((state) => state.siteConfig.vas.config.payment);

  return (
    <StyledBadge badgeContent={sku.chip} color="primary">
      <StyledCard>
        <CardContent>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }} color="textPrimary">
              {sku.name}
            </Typography>
            <Typography fontWeight={600} component="span" variant="h4" color="primary">
              {payment ? formatPrice(payment.currency_mark, sku.price, payment.currency_unit) : "-"}
            </Typography>
            <Typography variant="subtitle1" component={"span"} color="textSecondary" sx={{ ml: 1 }}>
              {t("vas.validDurationDays", {
                num: Math.ceil(sku.time / 86400),
              })}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box></Box>
          {sku.des.map((line) => (
            <Typography variant="subtitle1" key={line}>
              {line}
            </Typography>
          ))}
        </CardContent>
        <CardActions>
          <Button variant={"contained"} fullWidth onClick={() => onSelect(sku)}>
            {t("vas.purchaseNow")}
          </Button>
        </CardActions>
      </StyledCard>
    </StyledBadge>
  );
};

export default GroupSkuOption;
