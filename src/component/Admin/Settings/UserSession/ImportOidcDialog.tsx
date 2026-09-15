// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { DialogContent } from "@mui/material";
import { useCallback, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getOIDCWellknown } from "../../../../api/api.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { Code } from "../../../Common/Code.tsx";
import { DenseFilledTextField } from "../../../Common/StyledComponents.tsx";
import DraggableDialog from "../../../Dialogs/DraggableDialog.tsx";
import SettingForm from "../../../Pages/Setting/SettingForm.tsx";
import { NoMarginHelperText } from "../Settings.tsx";

export interface ImportOidcDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: (v: string) => void;
}

const ImportOidcDialog = ({ open, onClose, onImported }: ImportOidcDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [endpoint, setEndpoint] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(() => {
    setLoading(true);
    dispatch(
      getOIDCWellknown({
        endpoint,
      }),
    )
      .then((res) => {
        onImported(res);
        onClose();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [endpoint, onClose, onImported]);

  return (
    <DraggableDialog
      title={t("settings.importOidc")}
      showActions
      showCancel
      onAccept={onSubmit}
      disabled={endpoint == ""}
      loading={loading}
      dialogProps={{
        fullWidth: true,
        maxWidth: "md",
        open,
        onClose,
      }}
    >
      <DialogContent>
        <SettingForm lgWidth={12} title={t("settings.oidcWellknownUrl")}>
          <DenseFilledTextField value={endpoint} fullWidth onChange={(e) => setEndpoint(e.target.value)} />
          <NoMarginHelperText>
            <Trans ns="dashboard" i18nKey="settings.oidcWellknownUrlDes" components={[<Code />]} />
          </NoMarginHelperText>
        </SettingForm>
      </DialogContent>
    </DraggableDialog>
  );
};

export default ImportOidcDialog;
