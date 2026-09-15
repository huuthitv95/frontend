// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, DialogContent, Link, Skeleton, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { sendLicenseRefreshAuto, sendLicenseRefreshManual } from "../../../api/api.ts";
import { License } from "../../../api/dashboard.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { DefaultCloseAction } from "../../Common/Snackbar/snackbar.tsx";
import { FilledTextField, SecondaryButton } from "../../Common/StyledComponents.tsx";
import TimeBadge from "../../Common/TimeBadge.tsx";
import DraggableDialog, { StyledDialogContentText } from "../../Dialogs/DraggableDialog.tsx";
import InfoRow from "../../FileManager/Sidebar/InfoRow.tsx";
import ArrowSync from "../../Icons/ArrowSync.tsx";
import Open from "../../Icons/Open.tsx";

export interface RefreshLicenseButtonProps {
  onLicenseRefreshed?: (l: License) => void;
}

export const RefreshLicenseButton: React.FC<RefreshLicenseButtonProps> = ({ onLicenseRefreshed }) => {
  const { t } = useTranslation("dashboard");
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [manualDialog, setManualDialog] = useState(false);
  const [offlineLicense, setOfflineLicense] = useState("");
  const refreshLicenseAuto = () => {
    setLoading(true);
    dispatch(sendLicenseRefreshAuto())
      .then((l) => {
        setLoading(false);
        if (onLicenseRefreshed) {
          onLicenseRefreshed(l);
        }
        enqueueSnackbar({
          message: t("summary.refreshSuccessfully"),
          variant: "success",
          action: DefaultCloseAction,
        });
      })
      .catch(() => {
        setManualDialog(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const refreshLicenseManual = () => {
    setLoading(true);
    dispatch(sendLicenseRefreshManual({ license: offlineLicense }))
      .then((l) => {
        setLoading(false);
        setManualDialog(false);
        if (onLicenseRefreshed) {
          onLicenseRefreshed(l);
        }
        enqueueSnackbar({
          message: t("summary.refreshSuccessfully"),
          variant: "success",
          action: DefaultCloseAction,
        });
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <DraggableDialog
        title={t("summary.manualRefresh")}
        showCancel
        showActions
        onAccept={refreshLicenseManual}
        loading={loading}
        dialogProps={{
          open: manualDialog,
          onClose: () => setManualDialog(false),
          fullWidth: true,
          maxWidth: "sm",
        }}
      >
        <DialogContent>
          <StyledDialogContentText>
            <Trans
              ns={"dashboard"}
              i18nKey={"summary.manualRefreshDes"}
              components={[<Link key={0} href={"https://cloudreve.org/login"} target={"_blank"} />]}
            />
          </StyledDialogContentText>
          <FilledTextField
            sx={{ mt: 1 }}
            fullWidth
            onChange={(e) => setOfflineLicense(e.target.value)}
            value={offlineLicense}
            required
            multiline
            rows={6}
          />
        </DialogContent>
      </DraggableDialog>
      <SecondaryButton onClick={refreshLicenseAuto} loading={loading} variant={"contained"} startIcon={<ArrowSync />}>
        {t("summary.renew")}
      </SecondaryButton>
    </>
  );
};

export interface LicenseManagementProps {
  license?: License;
  onLicenseRefreshed?: (l: License) => void;
}

export const LicenseManagement: React.FC<LicenseManagementProps> = ({ license, onLicenseRefreshed }) => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      {!license && (
        <>
          <Skeleton variant={"text"} width={"70%"} />
          <Skeleton variant={"text"} width={"50%"} />
        </>
      )}
      {license && (
        <>
          <InfoRow title={t("summary.licenseExpireAt")} content={t("summary.permanentLicense")} />
          <InfoRow
            title={t("summary.offlineLicenseExpireAy")}
            content={
              <Box>
                <TimeBadge datetime={license.expired_at} variant={"inherit"} />
                <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>
                  {t("summary.offlineLicenseDes")}
                </Typography>
              </Box>
            }
          />
          <InfoRow title={t("summary.licensedDomains")} content={license.domains.join(", ")} />
          <InfoRow
            title={t("summary.iosVol")}
            content={
              <Box>
                {license.vol_domains.join(", ")}
                <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>
                  <Trans
                    ns={"dashboard"}
                    i18nKey={"summary.volPurchase"}
                    components={[
                      <Link key={0} href={"https://cloudreve.org/login"} target={"_blank"} />,
                      <Link key={1} href={"https://cloudreve.org/ios"} target={"_blank"} />,
                    ]}
                  />
                </Typography>
              </Box>
            }
          />
          <Stack spacing={1} direction={"row"}>
            <SecondaryButton
              variant={"contained"}
              startIcon={<Open />}
              onClick={() => window.open("https://cloudreve.org/login")}
            >
              {t("summary.manageLicense")}
            </SecondaryButton>
            <RefreshLicenseButton onLicenseRefreshed={onLicenseRefreshed} />
          </Stack>
        </>
      )}
    </>
  );
};
