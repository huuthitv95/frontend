// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Button, ListItemText, Popover, PopoverProps, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField, DenseSelect } from "../../Common/StyledComponents";
import { SquareMenuItem } from "../../FileManager/ContextMenu/ContextMenu";
import SettingForm from "../../Pages/Setting/SettingForm";

export interface EventFilterPopoverProps extends PopoverProps {
  user: string;
  setUser: (user: string) => void;
  reporter: string;
  setReporter: (reporter: string) => void;
  share: string;
  setShare: (share: string) => void;
  fileUri: string;
  setFileUri: (fileUri: string) => void;
  reason: string;
  setReason: (reason: string) => void;
  clearFilters: () => void;
}

const AbuseReportFilterPopover = ({
  user,
  setUser,
  reporter,
  setReporter,
  share,
  setShare,
  fileUri,
  setFileUri,
  reason,
  setReason,
  clearFilters,
  onClose,
  open,
  ...rest
}: EventFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  // Create local state to track changes before applying
  const [localUser, setLocalUser] = useState(user);
  const [localReporter, setLocalReporter] = useState(reporter);
  const [localShare, setLocalShare] = useState(share);
  const [localFileUri, setLocalFileUri] = useState(fileUri);
  const [localReason, setLocalReason] = useState<string | undefined>(reason);

  // Initialize local state when popup opens
  useEffect(() => {
    if (open) {
      setLocalUser(user);
      setLocalReporter(reporter);
      setLocalShare(share);
      setLocalFileUri(fileUri);
      setLocalReason(reason);
    }
  }, [open]);

  // Apply filters and close popover
  const handleApplyFilters = () => {
    setUser(localUser);
    setReporter(localReporter);
    setShare(localShare);
    setFileUri(localFileUri);
    setReason(localReason ?? "");
    onClose?.({}, "backdropClick");
  };

  // Reset filters and close popover
  const handleResetFilters = () => {
    setLocalUser("");
    setLocalReporter("");
    setLocalShare("");
    setLocalFileUri("");
    setLocalReason("");
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
        <SettingForm title={t("abuseReport.reporterID")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localReporter}
            onChange={(e) => setLocalReporter(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("abuseReport.reportedUserID")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localUser}
            onChange={(e) => setLocalUser(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("abuseReport.shareID")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localShare}
            onChange={(e) => setLocalShare(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("abuseReport.reason")} noContainer lgWidth={12}>
          <DenseSelect
            fullWidth
            displayEmpty
            value={localReason !== "" ? parseInt(localReason ?? "-1") : -1}
            onChange={(e) => setLocalReason(e.target.value === -1 ? undefined : (e.target.value as string))}
          >
            {/* @ts-ignore */}
            {t("application:vas.reportReasonOptions", { returnObjects: true }).map((value, index) => (
              <SquareMenuItem key={index} value={index.toString()}>
                <ListItemText
                  primary={value}
                  slotProps={{
                    primary: {
                      variant: "body2",
                    },
                  }}
                />
              </SquareMenuItem>
            ))}
            <SquareMenuItem value={-1}>
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

export default AbuseReportFilterPopover;
