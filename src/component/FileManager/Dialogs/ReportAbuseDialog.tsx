// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { DialogContent, ListItemText, Stack } from "@mui/material";
import { useSnackbar } from "notistack";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { sendCreateAbuseReport } from "../../../api/api.ts";
import { closeReportAbuseDialog } from "../../../redux/globalStateSlice.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { Captcha, CaptchaParams } from "../../Common/Captcha/Captcha.tsx";
import { DefaultCloseAction } from "../../Common/Snackbar/snackbar.tsx";
import { DenseFilledTextField, DenseSelect } from "../../Common/StyledComponents.tsx";
import StyledFormControl from "../../Common/StyledFormControl.tsx";
import UserBadge from "../../Common/User/UserBadge.tsx";
import DraggableDialog from "../../Dialogs/DraggableDialog.tsx";
import { SquareMenuItem } from "../ContextMenu/ContextMenu.tsx";
import FileBadge from "../FileBadge.tsx";
import { FileManagerIndex } from "../FileManager.tsx";

const ReportAbuseDialog = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const formRef = useRef<HTMLFormElement>(null);

  const [reason, setReason] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [captchaState, setCaptchaState] = useState<CaptchaParams>({});
  const [captchaGen, setCaptchaGen] = useState(0);

  const open = useAppSelector((state) => state.globalState.reportAbuseDialogOpen);
  const share = useAppSelector((state) => state.globalState.reportAbuseDialogShare);
  const user = useAppSelector((state) => state.globalState.reportAbuseDialogUser);
  const currentPath = useAppSelector((state) => state.fileManager[FileManagerIndex.main].pure_path);
  const captcha_enabled = useAppSelector((state) => state.siteConfig.basic?.config?.abuse_report_captcha);

  const onClose = useCallback(() => {
    dispatch(closeReportAbuseDialog());
    setReason(0);
    setDescription("");
  }, [dispatch]);

  const onDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  }, []);

  const onSubmit = useCallback(() => {
    if (!formRef.current) {
      return;
    }
    if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }

    setLoading(true);
    dispatch(
      sendCreateAbuseReport({
        file_uri: share ? currentPath : undefined,
        share_id: share?.id,
        user_id: user?.id,
        category: reason,
        description,
        ...captchaState,
      }),
    )
      .then(() => {
        enqueueSnackbar({
          message: t("vas.reportAbuseSuccess"),
          variant: "success",
          action: DefaultCloseAction,
        });
        onClose();
      })
      .catch((e) => {
        setCaptchaGen((g) => g + 1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dispatch, enqueueSnackbar, t, onClose, share, currentPath, reason, description, captchaState]);

  return (
    <DraggableDialog
      title={t("application:vas.report")}
      showActions
      showCancel
      onAccept={onSubmit}
      loading={loading}
      dialogProps={{
        maxWidth: "xs",
        open: !!open,
        fullWidth: true,
        onClose,
      }}
    >
      <DialogContent>
        <form ref={formRef}>
          <Stack gap={2}>
            <StyledFormControl title={t("application:vas.reportTarget")}>
              {share && !user && currentPath && (
                <FileBadge
                  sx={{ height: "40px" }}
                  clickable={false}
                  variant={"outlined"}
                  simplifiedFile={{ path: currentPath, type: share.source_type ?? 0 }}
                />
              )}
              {user && <UserBadge user={user} sx={{ width: 24, height: 24 }} textProps={{ variant: "body2" }} />}
            </StyledFormControl>
            <StyledFormControl title={t("application:vas.reportReason")}>
              <DenseSelect fullWidth value={reason} onChange={(e) => setReason(Number(e.target.value))}>
                {/* @ts-ignore */}
                {t("application:vas.reportReasonOptions", { returnObjects: true }).map(
                  (reasonText: string, index: number) => (
                    <SquareMenuItem key={index} value={index}>
                      <ListItemText
                        slotProps={{
                          primary: { variant: "body2" },
                        }}
                      >
                        {reasonText}
                      </ListItemText>
                    </SquareMenuItem>
                  ),
                )}
              </DenseSelect>
            </StyledFormControl>
            <StyledFormControl title={t("application:vas.reportDescription")}>
              <DenseFilledTextField
                slotProps={{
                  htmlInput: {
                    maxLength: 512,
                  },
                }}
                fullWidth
                multiline
                rows={4}
                value={description}
                onChange={onDescriptionChange}
              />
            </StyledFormControl>
            {captcha_enabled && (
              <StyledFormControl title={t("application:login.captcha")}>
                <Captcha
                  noLabel
                  generation={captchaGen}
                  required={true}
                  fullWidth={true}
                  onStateChange={setCaptchaState}
                />
              </StyledFormControl>
            )}
          </Stack>
        </form>
      </DialogContent>
    </DraggableDialog>
  );
};
export default ReportAbuseDialog;
