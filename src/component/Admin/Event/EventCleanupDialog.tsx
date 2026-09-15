// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Button, DialogContent, SelectChangeEvent, Stack, Typography } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendCleanupAuditLog } from "../../../api/api";
import { CleanupAuditLogService } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import DraggableDialog from "../../Dialogs/DraggableDialog";
import SettingForm from "../../Pages/Setting/SettingForm";
import EventTypeSelector from "./EventTypeSelector";

export interface EventCleanupDialogProps {
  open: boolean;
  onClose: () => void;
  onCleanupComplete?: () => void;
}

const EventCleanupDialog = ({ open, onClose, onCleanupComplete }: EventCleanupDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [notAfter, setNotAfter] = useState<dayjs.Dayjs | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCleanup = async () => {
    if (!notAfter) {
      return;
    }

    setLoading(true);
    try {
      const args: CleanupAuditLogService = {
        not_after: notAfter.toISOString(),
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      };

      await dispatch(sendCleanupAuditLog(args));
      onCleanupComplete?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNotAfter(null);
    setSelectedCategories([]);
  };

  return (
    <DraggableDialog
      title={t("event.cleanupAuditLog")}
      dialogProps={{
        open,
        onClose,
        maxWidth: "sm",
        fullWidth: true,
      }}
      showActions={true}
      showCancel={true}
      onAccept={handleCleanup}
      loading={loading}
      disabled={!notAfter}
      okText={t("event.cleanup")}
      secondaryAction={
        <Button onClick={handleReset} disabled={loading}>
          {t("user.reset")}
        </Button>
      }
    >
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            {t("event.cleanupAuditLogDescription")}
          </Typography>

          <SettingForm title={t("event.cleanupNotAfter")} noContainer lgWidth={12}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                value={notAfter}
                onChange={(newValue) => setNotAfter(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: "small",
                  },
                }}
              />
            </LocalizationProvider>
          </SettingForm>

          <SettingForm title={t("event.type")} noContainer lgWidth={12}>
            <EventTypeSelector
              value={selectedCategories}
              onChange={(e: SelectChangeEvent<unknown>) => setSelectedCategories(e.target.value as number[])}
              helperText={t("event.cleanupEventTypesDes")}
              showAllOption={true}
              displayEmpty={true}
            />
          </SettingForm>
        </Stack>
      </DialogContent>
    </DraggableDialog>
  );
};

export default EventCleanupDialog;
