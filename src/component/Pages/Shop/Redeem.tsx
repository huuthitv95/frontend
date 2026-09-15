// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import * as React from "react";
import { useCallback, useState } from "react";
import { Box, Button, Container, DialogContent, FilledInput, FormControl, InputLabel, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { getGiftCode, sendRedeemGiftCode } from "../../../api/api.ts";
import { GiftCodeSummary } from "../../../api/vas.ts";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import { NoWrapTypography } from "../../Common/StyledComponents.tsx";
import { useSnackbar } from "notistack";
import { DefaultCloseAction } from "../../Common/Snackbar/snackbar.tsx";
const Redeem = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<GiftCodeSummary | undefined>();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const verifyGiftCode = useCallback(() => {
    setLoading(true);
    dispatch(getGiftCode(code))
      .then((res) => {
        setSummary(res);
        setSummaryOpen(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [code, dispatch]);

  const submitRedeem = useCallback(() => {
    setLoading(true);
    dispatch(sendRedeemGiftCode(code))
      .then(() => {
        setSummaryOpen(false);
        setCode("");
        enqueueSnackbar({
          variant: "success",
          message: t("vas.productDelivered"),
          action: DefaultCloseAction,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [code, t, dispatch]);

  return (
    <Box sx={{ mt: 2 }}>
      <DraggableDialog
        title={t("vas.confirmRedeem")}
        showActions
        loading={loading}
        onAccept={submitRedeem}
        showCancel
        dialogProps={{
          open: summaryOpen,
          onClose: () => setSummaryOpen(false),
          fullWidth: true,
          maxWidth: "sm",
        }}
      >
        <DialogContent sx={{ pb: 0 }}>
          {summary && (
            <Box sx={{ display: "flex" }}>
              <Typography fontWeight={500}>{summary?.name}</Typography>
              <NoWrapTypography sx={{ ml: 2 }} color={"text.secondary"}>
                {summary?.duration
                  ? t("vas.validDurationDays", {
                      num: Math.ceil((summary?.duration * summary?.qyt) / 86400),
                    })
                  : `x ${summary?.qyt}`}
              </NoWrapTypography>
            </Box>
          )}
        </DialogContent>
      </DraggableDialog>
      <Container maxWidth="lg">
        <FormControl fullWidth sx={{ mt: 2 }} variant={"filled"}>
          <InputLabel htmlFor="component-helper">{t("vas.enterGiftCode")}</InputLabel>
          <FilledInput
            inputProps={{
              style: { textTransform: "uppercase" },
            }}
            autoFocus={true}
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
          />
        </FormControl>
        <Button onClick={verifyGiftCode} variant={"contained"} sx={{ mt: 2 }} disabled={!code}>
          {t("login.continue")}
        </Button>
      </Container>
    </Box>
  );
};

export default Redeem;
