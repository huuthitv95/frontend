// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, DialogContent, DialogContentText, Link, Typography } from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import DraggableDialog from "../../Dialogs/DraggableDialog";
import { RefreshLicenseButton } from "../Home/LicenseManagement";

export interface DomainLicenseWarningDialogProps {
  open: boolean;
  onClose: () => void;
}

const DomainLicenseWarningDialog = ({ open, onClose }: DomainLicenseWarningDialogProps) => {
  const { t } = useTranslation("dashboard");
  return (
    <DraggableDialog
      title={t("settings.domainNotLicensed")}
      dialogProps={{ open, onClose, maxWidth: "sm", fullWidth: true }}
    >
      <DialogContent>
        <DialogContentText>
          <Typography variant="body2">
            <Trans
              i18nKey="settings.domainNotLicensedDes"
              ns="dashboard"
              components={[<Link href="https://cloudreve.org/login" target="_blank" />]}
            />
          </Typography>
        </DialogContentText>
        <Box sx={{ mt: 2 }}>
          <RefreshLicenseButton onLicenseRefreshed={onClose} />
        </Box>
      </DialogContent>
    </DraggableDialog>
  );
};

export default DomainLicenseWarningDialog;
