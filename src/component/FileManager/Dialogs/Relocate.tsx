// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useTranslation } from "react-i18next";
import {
  CircularProgress,
  DialogContent,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { useCallback, useEffect, useState } from "react";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import { closeRelocateDialog } from "../../../redux/globalStateSlice.ts";
import { sendRelocate } from "../../../api/api.ts";
import { getFileLinkedUri } from "../../../util";
import { useSnackbar } from "notistack";
import { ViewTaskAction } from "../../Common/Snackbar/snackbar.tsx";
import StorageOutlined from "../../Icons/StorageOutlined.tsx";
import { refreshPolicyOptions } from "../../../redux/thunks/settings.ts";

const Relocate = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState("");
  const policyOptions = useAppSelector((state) => state.globalState.policyOptionCache);

  useEffect(() => {
    if (!policyOptions) {
      dispatch(refreshPolicyOptions()).then((res) => {
        setPolicy(res[0].id);
      });
    }

    if (policyOptions && policyOptions.length > 0) {
      setPolicy(policyOptions[0].id);
    }
  }, []);

  const open = useAppSelector((state) => state.globalState.relocateDialogOpen);
  const targets = useAppSelector((state) => state.globalState.relocateDialogFiles);

  const onClose = useCallback(() => {
    dispatch(closeRelocateDialog());
  }, [dispatch]);

  const onAccept = useCallback(() => {
    if (!targets) {
      return;
    }

    setLoading(true);
    dispatch(
      sendRelocate({
        src: targets.map((t) => getFileLinkedUri(t)),
        dst_policy_id: policy,
      }),
    )
      .then(() => {
        dispatch(closeRelocateDialog());
        enqueueSnackbar({
          message: t("modals.taskCreated"),
          variant: "success",
          action: ViewTaskAction(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targets, policy]);

  return (
    <DraggableDialog
      title={t("vas.migrateStoragePolicy")}
      showActions
      loading={loading}
      disabled={!policy}
      showCancel
      onAccept={onAccept}
      dialogProps={{
        open: open ?? false,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "xs",
        disableRestoreFocus: true,
      }}
    >
      <DialogContent sx={{ pt: 1 }}>
        <FormControl variant="outlined" fullWidth>
          <InputLabel>{t("application:fileManager.storagePolicy")}</InputLabel>
          <Select
            variant="outlined"
            startAdornment={
              !isMobile && (
                <InputAdornment position="start">
                  {!policyOptions || policyOptions.length == 0 ? (
                    <CircularProgress sx={{ pt: "6px" }} size={24} />
                  ) : (
                    <StorageOutlined />
                  )}
                </InputAdornment>
              )
            }
            label={t("application:fileManager.storagePolicy")}
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
          >
            {policyOptions &&
              policyOptions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </DialogContent>
    </DraggableDialog>
  );
};
export default Relocate;
