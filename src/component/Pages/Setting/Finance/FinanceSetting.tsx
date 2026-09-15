// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks.ts";
import SettingForm from "../SettingForm.tsx";
import React, { useEffect, useState } from "react";
import { loadSiteConfig } from "../../../../redux/thunks/site.ts";
import { useNavigate } from "react-router-dom";
import { UserSettings } from "../../../../api/user.ts";
import Sparkle from "../../../Icons/Sparkle.tsx";
import { ProductType } from "../../../../api/vas.ts";
import PurchaseProductDialog from "../../../VAS/PurchaseProductDialog.tsx";
import { SecondaryButton } from "../../../Common/StyledComponents.tsx";
import Savings from "../../../Icons/Savings.tsx";
import CreditChangeLogs from "./CreditChangeLogs.tsx";
import PaymentList from "./PaymentList.tsx";

export interface FinanceSettingProps {
  setting: UserSettings;
  setSetting: (setting: UserSettings) => void;
}

const FinanceSetting = ({ setting }: FinanceSettingProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { point_enabled, point_price } = useAppSelector((state) => state.siteConfig.vas.config);

  const [purchaseOpen, setPurchaseOpen] = useState(false);

  useEffect(() => {
    dispatch(loadSiteConfig("vas"));
  }, []);

  return (
    <Stack spacing={3}>
      <PurchaseProductDialog
        type={ProductType.points}
        name={t("vas.credits")}
        priceCashUnit={point_price ?? 0}
        open={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
      />
      <SettingForm title={t("vas.credits")}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant={"h4"}
            color={"primary"}
            fontWeight={600}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Sparkle />
            {setting.credit ?? 0}
          </Typography>
          <SecondaryButton onClick={() => setPurchaseOpen(true)} variant={"contained"} startIcon={<Savings />}>
            {t("vas.recharge")}
          </SecondaryButton>
        </Box>
      </SettingForm>
      <SettingForm title={t("vas.creditChanges")}>
        <CreditChangeLogs />
      </SettingForm>
      <SettingForm title={t("vas.payments")} lgWidth={12}>
        <PaymentList />
      </SettingForm>
    </Stack>
  );
};

export default FinanceSetting;
