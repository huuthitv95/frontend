// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { DialogContent, List, ListItemButton, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendSetSetting } from "../../../api/api.ts";
import { AppError, Code } from "../../../api/request.ts";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { StyledListItemText } from "../../Common/StyledComponents.tsx";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import DomainLicenseWarningDialog from "../Settings/DomainLicenseWarningDialog.tsx";

export interface SiteUrlWarningProps {
  open: boolean;
  onClose: () => void;
  existingUrls: string[];
}

const SiteUrlWarning = ({ open, onClose, existingUrls }: SiteUrlWarningProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [domainLicenseWarningDialogOpen, setDomainLicenseWarningDialogOpen] = useState(false);

  const setSiteUrl = (isPrimary: boolean) => () => {
    const urls = [...existingUrls];
    if (isPrimary) {
      urls.unshift(window.location.origin);
    } else {
      urls.push(window.location.origin);
    }
    onClose();
    dispatch(
      sendSetSetting({
        settings: {
          siteURL: urls.join(","),
        },
      }),
    ).catch((e) => {
      if (e instanceof AppError && e.code == Code.DomainNotLicensed) {
        setDomainLicenseWarningDialogOpen(true);
      }
    });
  };

  return (
    <>
      <DomainLicenseWarningDialog
        open={domainLicenseWarningDialogOpen}
        onClose={() => setDomainLicenseWarningDialogOpen(false)}
      />
      <DraggableDialog
        dialogProps={{
          open,
          onClose,
          maxWidth: "sm",
          fullWidth: true,
        }}
        title={t("summary.confirmSiteURLTitle")}
      >
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="body2" color={"textSecondary"}>
              {t("summary.siteURLNotMatch", {
                current: window.location.origin,
              })}
            </Typography>
            <List dense>
              <ListItemButton onClick={setSiteUrl(true)}>
                <StyledListItemText
                  primary={t("summary.setAsPrimary")}
                  secondary={t("summary.setAsPrimaryDes", {
                    current: window.location.origin,
                  })}
                />
              </ListItemButton>
              <ListItemButton onClick={setSiteUrl(false)}>
                <StyledListItemText
                  primary={t("summary.setAsSecondary")}
                  secondary={t("summary.setAsSecondaryDes", {
                    current: window.location.origin,
                  })}
                />
              </ListItemButton>
            </List>
            <Typography variant="body2" color={"textSecondary"}>
              {t("summary.siteURLDescription")}
            </Typography>
          </Stack>
        </DialogContent>
      </DraggableDialog>
    </>
  );
};

export default SiteUrlWarning;
