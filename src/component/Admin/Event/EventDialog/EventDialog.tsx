// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, DialogContent } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { getAuditLogDetail } from "../../../../api/api.ts";
import { AuditLog } from "../../../../api/dashboard.ts";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import AutoHeight from "../../../Common/AutoHeight.tsx";
import FacebookCircularProgress from "../../../Common/CircularProgress.tsx";
import DraggableDialog from "../../../Dialogs/DraggableDialog.tsx";
import EventForm from "./EventForm";
export interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  eventID?: number;
}

const EventDialog = ({ open, onClose, eventID }: EventDialogProps) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("dashboard");
  const [values, setValues] = useState<AuditLog>({ edges: {}, id: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventID || !open) {
      return;
    }
    setLoading(true);
    dispatch(getAuditLogDetail(eventID))
      .then((res) => {
        setValues(res);
      })
      .catch(() => {
        onClose();
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  return (
    <DraggableDialog
      title={t("event.eventDialogTitle")}
      dialogProps={{
        fullWidth: true,
        maxWidth: "md",
        open: open,
        onClose: onClose,
      }}
    >
      <DialogContent>
        <AutoHeight>
          <SwitchTransition>
            <CSSTransition
              addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
              classNames="fade"
              key={`${loading}`}
            >
              <Box>
                {loading && (
                  <Box
                    sx={{
                      py: 15,
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FacebookCircularProgress />
                  </Box>
                )}
                {!loading && <EventForm values={values} />}
              </Box>
            </CSSTransition>
          </SwitchTransition>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};

export default EventDialog;
