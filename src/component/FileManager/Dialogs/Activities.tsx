// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useTranslation } from "react-i18next";
import { DialogContent } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { useCallback } from "react";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import { closeShowActivityDialog } from "../../../redux/globalStateSlice.ts";
import AutoHeight from "../../Common/AutoHeight.tsx";
import Activities from "../Sidebar/Activities.tsx";

const ActivitiesDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const open = useAppSelector((state) => state.globalState.activityDialogOpen);
  const target = useAppSelector((state) => state.globalState.activityDialogFile);

  const onClose = useCallback(() => {
    dispatch(closeShowActivityDialog());
  }, [dispatch]);

  return (
    <DraggableDialog
      title={t("application:fileManager.activity")}
      dialogProps={{
        open: open ?? false,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "sm",
        disableRestoreFocus: true,
      }}
    >
      <DialogContent>
        <AutoHeight>{target && <Activities target={target} key={target.path} />}</AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};
export default ActivitiesDialog;
