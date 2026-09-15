// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Button, Popover, PopoverProps, SelectChangeEvent, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DenseFilledTextField } from "../../Common/StyledComponents";
import SettingForm from "../../Pages/Setting/SettingForm";
import EventTypeSelector from "./EventTypeSelector";

export interface EventFilterPopoverProps extends PopoverProps {
  user: string;
  setUser: (user: string) => void;
  ip: string;
  setIp: (ip: string) => void;
  type: string;
  setType: (type: string) => void;
  correlationId: string;
  setCorrelationId: (correlationId: string) => void;
  file: string;
  setFile: (file: string) => void;
  clearFilters: () => void;
}

const EventFilterPopover = ({
  user,
  setUser,
  ip,
  setIp,
  type,
  setType,
  correlationId,
  setCorrelationId,
  file,
  setFile,
  clearFilters,
  onClose,
  open,
  ...rest
}: EventFilterPopoverProps) => {
  const { t } = useTranslation("dashboard");

  // Create local state to track changes before applying
  const [localUser, setLocalUser] = useState(user);
  const [localIp, setLocalIp] = useState(ip);
  const [localType, setLocalType] = useState(type);
  const [localCorrelationId, setLocalCorrelationId] = useState(correlationId);
  const [localFile, setLocalFile] = useState(file);

  // Initialize local state when popup opens
  useEffect(() => {
    if (open) {
      setLocalUser(user);
      setLocalIp(ip);
      setLocalType(type);
      setLocalCorrelationId(correlationId);
      setLocalFile(file);
    }
  }, [open]);

  // Apply filters and close popover
  const handleApplyFilters = () => {
    setUser(localUser);
    setIp(localIp);
    setType(localType);
    setCorrelationId(localCorrelationId);
    setFile(localFile);
    onClose?.({}, "backdropClick");
  };

  // Reset filters and close popover
  const handleResetFilters = () => {
    setLocalUser("");
    setLocalIp("");
    setLocalType("");
    setLocalCorrelationId("");
    setLocalFile("");
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

        <SettingForm title={t("event.ip")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            value={localIp}
            onChange={(e) => setLocalIp(e.target.value)}
            placeholder={t("user.emptyNoFilter")}
            size="small"
          />
        </SettingForm>

        <SettingForm title={t("event.type")} noContainer lgWidth={12}>
          <EventTypeSelector
            value={localType === "" ? [] : localType.split(",").map((t) => parseInt(t) ?? 0)}
            onChange={(e: SelectChangeEvent<unknown>) => {
              setLocalType((e.target.value as string[]).join(","));
            }}
          />
        </SettingForm>

        <SettingForm title={t("event.correlationId")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            placeholder={t("user.emptyNoFilter")}
            value={localCorrelationId}
            onChange={(e) => setLocalCorrelationId(e.target.value)}
          />
        </SettingForm>

        <SettingForm title={t("event.fileID")} noContainer lgWidth={12}>
          <DenseFilledTextField
            fullWidth
            placeholder={t("user.emptyNoFilter")}
            value={localFile}
            onChange={(e) => setLocalFile(e.target.value)}
          />
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

export default EventFilterPopover;
