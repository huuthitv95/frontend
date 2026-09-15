// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { setHeadlessFrameLoading } from "../../../../redux/globalStateSlice.ts";
import { sendOpenIDCallback } from "../../../../api/api.ts";
import { useNavigate, useParams } from "react-router-dom";
import { AppError } from "../../../../api/request.ts";
import DismissCircleFilled from "../../../Icons/DismissCircleFilled.tsx";
import { LoginResponse, OpenIDProvider } from "../../../../api/user.ts";
import { refreshUserSession, setTargetSession } from "../../../../redux/thunks/session.ts";
import { useQuery } from "../../../../util";
import { OAUTH_REDIRECT_KEY } from "./SignIn.tsx";

const OpenIDCallback = ({ v3qq }: { v3qq?: boolean }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { provider } = useParams<{ provider: string }>();
  const [error, setError] = React.useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    dispatch(setHeadlessFrameLoading(true));
    dispatch(
      sendOpenIDCallback({
        provider_id: v3qq ? OpenIDProvider.qq : parseInt(provider ?? "0") ?? 0,
        code: query.get("code") ?? "",
        session_id: query.get("state") ?? "",
      }),
    )
      .then((res) => {
        if (res?.user) {
          const loginRes = res as LoginResponse;

          // Check if this is an OAuth flow redirect
          const oauthRedirectUrl = localStorage.getItem(OAUTH_REDIRECT_KEY);
          if (oauthRedirectUrl) {
            // Set the session and redirect back to OAuth authorize page
            dispatch(setTargetSession(loginRes));
            localStorage.removeItem(OAUTH_REDIRECT_KEY);
            window.location.href = oauthRedirectUrl;
          } else {
            dispatch(refreshUserSession(loginRes, query.get("redirect")));
          }
        } else {
          navigate("/settings");
        }
      })
      .catch((e) => {
        if (e instanceof AppError) {
          setError(e.message);
        } else {
          setError(e.toString());
        }

        dispatch(setHeadlessFrameLoading(false));
      });
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 7,
        pb: 9,
      }}
    >
      <DismissCircleFilled fontSize={"large"} color={"error"} />
      <Typography
        variant={"body2"}
        sx={{
          color: (theme) => theme.palette.error.main,
          mt: 2,
        }}
      >
        {error}
      </Typography>
    </Box>
  );
};

export default OpenIDCallback;
