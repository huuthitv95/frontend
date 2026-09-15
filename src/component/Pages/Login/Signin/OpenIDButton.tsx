// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { OpenIDProvider } from "../../../../api/user.ts";
import { useTranslation } from "react-i18next";
import { ButtonProps } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import { useAppDispatch } from "../../../../redux/hooks.ts";
import { sendPrepareOpenIDSignIn } from "../../../../api/api.ts";

export interface OpenIDButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  name?: string;
  contentOverride?: React.ReactNode;
  provider: OpenIDProvider;
  hint?: string;
  linking?: boolean;
}

export const OpenIDButton = ({ icon, name, provider, linking, hint, contentOverride, ...rest }: OpenIDButtonProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const onClick = () => {
    setLoading(true);
    dispatch(sendPrepareOpenIDSignIn({ hint: hint, provider, linking }))
      .then((url) => {
        window.location.href = url;
      })
      .catch(() => {
        setLoading(false);
      });
  };
  return (
    <LoadingButton variant={"outlined"} startIcon={icon} fullWidth onClick={onClick} {...rest} loading={loading}>
      <span>
        {contentOverride
          ? contentOverride
          : t("vas.loginWith", {
              name: t(name ?? ""),
            })}
      </span>
    </LoadingButton>
  );
};
