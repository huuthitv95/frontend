// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Typography } from "@mui/material";
import CheckmarkCircle from "../../Icons/CheckmarkCircle.tsx";
import React from "react";
import { useTranslation } from "react-i18next";

const PaymentCallback = () => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 7,
        pb: 9,
      }}
    >
      <CheckmarkCircle fontSize={"large"} color={"success"} />
      <Typography
        variant={"h6"}
        sx={{
          color: (theme) => theme.palette.success.main,
          mt: 1,
        }}
      >
        {t("application:vas.paymentSuccess")}
      </Typography>
    </Box>
  );
};

export default PaymentCallback;
