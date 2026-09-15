// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { DialogContent } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../redux/hooks.ts";
import SessionManager, { UserSettings } from "../../session";
import DraggableDialog from "./DraggableDialog.tsx";

const cyrb53 = (str: string, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const SiteNotice = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);

  const content = useAppSelector((state) => state.siteConfig.basic.config?.site_notice);

  const setRead = () => {
    setShow(false);
    SessionManager.set(UserSettings.ReadNotice, cyrb53(content ?? ""));
  };
  useEffect(() => {
    const isLogined = SessionManager.currentLoginOrNull() != null;
    if (isLogined) {
      const newNotice = SessionManager.get(UserSettings.ReadNotice);
      if (content && newNotice !== cyrb53(content ?? "")) {
        setShow(true);
      }
    }
  }, [content]);

  return (
    <DraggableDialog
      title={t("application:vas.announcement")}
      showActions
      showCancel
      onAccept={() => setShow(false)}
      cancelText={t("vas.dontShowAgain")}
      dialogProps={{
        maxWidth: "sm",
        open: show,
        fullWidth: true,
        onClose: setRead,
      }}
    >
      <DialogContent
        dangerouslySetInnerHTML={{ __html: content ?? "" }}
        sx={{
          content: {
            overflowWrap: "break-word",
          },
        }}
      />
    </DraggableDialog>
  );
};
export default SiteNotice;
