// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useTranslation } from "react-i18next";
import { DialogContent, Stack, useMediaQuery, useTheme } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { useCallback, useEffect, useState } from "react";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import { closeCreateArchiveDialog } from "../../../redux/globalStateSlice.ts";
import { FileManagerIndex } from "../FileManager.tsx";
import { PathSelectorForm } from "../../Common/Form/PathSelectorForm.tsx";
import Archive from "../../Icons/Archive.tsx";
import { OutlineIconTextField } from "../../Common/Form/OutlineIconTextField.tsx";
import { AutoDispatch, NodeSelector } from "../../Common/Form/NodeSelector.tsx";
import SessionManager from "../../../session";
import Boolset from "../../../util/boolset.ts";
import { GroupPermission } from "../../../api/user.ts";
import { NodeCapability } from "../../../api/workflow.ts";
import { sendCreateArchive } from "../../../api/api.ts";
import { getFileLinkedUri } from "../../../util";
import CrUri from "../../../util/uri.ts";
import { useSnackbar } from "notistack";
import { ViewTaskAction } from "../../Common/Snackbar/snackbar.tsx";

const CreateArchive = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("archive.zip");
  const [path, setPath] = useState("");
  const [showNodeSelection, setShowNodeSelection] = useState(false);
  const [node, setNode] = useState(AutoDispatch);

  const open = useAppSelector((state) => state.globalState.createArchiveDialogOpen);
  const targets = useAppSelector((state) => state.globalState.createArchiveDialogFiles);
  const current = useAppSelector((state) => state.fileManager[FileManagerIndex.main].pure_path);

  useEffect(() => {
    if (open) {
      setPath(current ?? "");
      const perm = new Boolset(SessionManager.currentLoginOrNull()?.user.group?.permission);
      if (perm.enabled(GroupPermission.select_node)) {
        setShowNodeSelection(true);
      }
    }
  }, [open]);

  const onClose = useCallback(() => {
    dispatch(closeCreateArchiveDialog());
  }, [dispatch]);

  const onAccept = useCallback(() => {
    if (!targets) {
      return;
    }

    setLoading(true);
    const dst = new CrUri(path);
    dispatch(
      sendCreateArchive({
        src: targets?.map((t) => getFileLinkedUri(t)),
        dst: dst.join(fileName).toString(),
        preferred_node_id: node === AutoDispatch ? undefined : node,
      }),
    )
      .then(() => {
        dispatch(closeCreateArchiveDialog());
        enqueueSnackbar({
          message: t("modals.taskCreated"),
          variant: "success",
          action: ViewTaskAction(),
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [targets, fileName, node, path]);

  return (
    <DraggableDialog
      title={t("application:fileManager.createArchive")}
      showActions
      loading={loading}
      showCancel
      disabled={!fileName}
      onAccept={onAccept}
      dialogProps={{
        open: open ?? false,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "sm",
        disableRestoreFocus: true,
      }}
    >
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={3}>
          <OutlineIconTextField
            icon={<Archive />}
            variant="outlined"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            label={t("application:modals.zipFileName")}
            fullWidth
          />
          <Stack spacing={3} direction={isMobile ? "column" : "row"}>
            <PathSelectorForm onChange={setPath} path={path} label={t("modals.saveToTitle")} />
            {showNodeSelection && (
              <NodeSelector node={node} onChange={setNode} capacity={NodeCapability.create_archive} />
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </DraggableDialog>
  );
};
export default CreateArchive;
