// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import React, { memo, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AppError, Code, Response } from "../../../api/request.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { navigateToPath, retrySharePassword } from "../../../redux/thunks/filemanager.ts";
import SessionManager from "../../../session/index.ts";
import { Filesystem } from "../../../util/uri.ts";
import { FilledTextField, SecondaryButton } from "../../Common/StyledComponents.tsx";
import ArrowHookDownLeft from "../../Icons/ArrowHookDownLeft.tsx";
import ArrowLeft from "../../Icons/ArrowLeft.tsx";
import LinkDismiss from "../../Icons/LinkDismiss.tsx";
import LockClosed from "../../Icons/LockClosed.tsx";
import { FmIndexContext } from "../FmIndexContext.tsx";
import PurchasedRequiredError from "../PurchaseRequiredError.tsx";

interface ExplorerErrorProps {
  error?: Response<any>;
  [key: string]: any;
}

const RetryPassword = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fmIndex = useContext(FmIndexContext);
  const [password, setPassword] = useState("");

  return (
    <Box sx={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <LockClosed sx={{ fontSize: 80 }} color={"action"} />
      <Box sx={{ mt: 1 }}>
        <FilledTextField
          variant={"filled"}
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label={t("application:share.enterPassword")}
        />
        <Button
          disabled={password == ""}
          onClick={() => dispatch(retrySharePassword(fmIndex, password))}
          variant={"contained"}
          sx={{ ml: 1, height: "56px" }}
        >
          <ArrowLeft
            sx={{
              transform: "scaleX(-1)",
            }}
          />
        </Button>
      </Box>
    </Box>
  );
};

const ExplorerError = memo(
  React.forwardRef(({ error, ...rest }: ExplorerErrorProps, ref) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const fmIndex = useContext(FmIndexContext);
    const fs = useAppSelector((state) => state.fileManager[fmIndex].current_fs);
    const previousPath = useAppSelector((state) => state.fileManager[fmIndex].previous_path);
    const { t } = useTranslation("application");
    const appErr = useMemo(() => {
      if (error) {
        return new AppError(error);
      }

      return undefined;
    }, [error]);
    const navigateBack = useCallback(() => {
      previousPath && dispatch(navigateToPath(fmIndex, previousPath));
    }, [dispatch, fmIndex, previousPath]);

    const signIn = useCallback(() => {
      navigate("/session?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
    }, [navigate]);

    const currentUser = SessionManager.currentLoginOrNull();
    const anymouseAccessDenied = useMemo(() => {
      return (
        <Box sx={{ textAlign: "center" }}>
          <LockClosed sx={{ fontSize: 60 }} color={"action"} />
          <Typography color={"text.secondary"}>{t("application:fileManager.anonymousAccessDenied")}</Typography>
          <SecondaryButton variant={"contained"} color={"inherit"} onClick={signIn} sx={{ mt: 4 }}>
            {t("application:login.signIn")}
          </SecondaryButton>
        </Box>
      );
    }, [signIn, t]);

    const innerError = () => {
      switch (error?.code) {
        case Code.PermissionDenied:
          if (!currentUser) {
            return anymouseAccessDenied;
          }

          return (
            <Box sx={{ textAlign: "center" }}>
              <LockClosed sx={{ fontSize: 60 }} color={"action"} />
              <Typography color={"text.secondary"}>
                {t("application:fileManager.youDontHaveReadPermissionToThisFile")}
              </Typography>
              {previousPath && (
                <SecondaryButton
                  variant={"contained"}
                  color={"inherit"}
                  onClick={navigateBack}
                  startIcon={<ArrowHookDownLeft />}
                  sx={{ mt: 4 }}
                >
                  {t("application:fileManager.back")}
                </SecondaryButton>
              )}
            </Box>
          );
        case Code.AnonymouseAccessDenied:
          return anymouseAccessDenied;
        case Code.IncorrectPassword:
          return <RetryPassword />;
        case Code.PurchaseRequired:
          return <PurchasedRequiredError />;
        // @ts-ignore
        case Code.NodeFound:
          if (fs == Filesystem.share) {
            return (
              <Box sx={{ textAlign: "center" }}>
                <LinkDismiss sx={{ fontSize: 60 }} color={"action"} />
                <Typography color={"text.secondary"}>{t("application:share.shareNotExist")}</Typography>
              </Box>
            );
          }
        default:
          return (
            <Alert severity="warning">
              <AlertTitle> {t("application:fileManager.listError")}</AlertTitle>
              {appErr && appErr.message}
              {error?.correlation_id && (
                <Box sx={{ typography: "caption", mt: 2, opacity: 0.5 }}>
                  <code>{t("common:requestID", { id: error.correlation_id })}</code>
                </Box>
              )}
            </Alert>
          );
      }
    };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          ...rest.sx,
        }}
      >
        {innerError()}
      </Box>
    );
  }),
);

export default ExplorerError;
