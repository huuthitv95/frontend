// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Divider, FormControl, Link, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { LoginResponse, OpenIDProvider, PrepareLoginResponse } from "../../../../api/user.ts";
import { useAppSelector } from "../../../../redux/hooks.ts";
import { Captcha, CaptchaParams } from "../../../Common/Captcha/Captcha.tsx";
import CustomIcon from "../../../Common/CustomIcon.tsx";
import { OutlineIconTextField } from "../../../Common/Form/OutlineIconTextField.tsx";
import BranchCompare from "../../../Icons/BranchCompare.tsx";
import Password from "../../../Icons/Password.tsx";
import QQ from "../../../Icons/QQ.tsx";
import { OpenIDButton } from "../Signin/OpenIDButton.tsx";
import PasskeyLoginButton from "../Signin/PasskeyLoginButton.tsx";
import { Control } from "../Signin/SignIn.tsx";

interface PhaseCollectPasswordProps {
  pwd: string;
  email: string;
  setPwd: (pwd: string) => void;
  control?: Control;
  loginOptions?: PrepareLoginResponse;
  captchaGen: number;
  setCaptchaState: (state: CaptchaParams) => void;
  onForget?: () => void;
  onOAuthPasskeyLogin?: (response: LoginResponse) => void;
}

const PhaseCollectPassword = ({
  pwd,
  email,
  setPwd,
  control,
  loginOptions,
  captchaGen,
  setCaptchaState,
  onForget,
  onOAuthPasskeyLogin,
}: PhaseCollectPasswordProps) => {
  const { t } = useTranslation();
  const {
    login_captcha,
    authn,
    sso_display_name,
    sso_enabled,
    qq_enabled,
    oidc_enabled,
    oidc_display_name,
    sso_icon,
    oidc_icon,
  } = useAppSelector((state) => state.siteConfig.login.config);

  const moreOptions =
    (loginOptions?.webauthn_enabled && authn) ||
    (loginOptions?.sso_enabled && sso_enabled) ||
    (loginOptions?.qq_enabled && qq_enabled) ||
    (loginOptions?.oidc_enabled && oidc_enabled);
  return (
    <>
      {loginOptions?.password_enabled && (
        <>
          <Typography color={"text.secondary"}>{t("login.enterPasswordHint", { email: email })}</Typography>
          <FormControl variant="standard" margin="normal" required fullWidth>
            <OutlineIconTextField
              autoFocus={true}
              variant={"outlined"}
              label={t("login.password")}
              inputProps={{
                name: "password",
                type: "password",
                id: "password",
                required: "true",
                maxLength: 128,
                minLength: 4,
              }}
              onChange={(e) => setPwd(e.target.value)}
              icon={<Password />}
              value={pwd}
              autoComplete={"true"}
            />
            <Link sx={{ mt: 1 }} underline="hover" variant="body2" href={"#"} onClick={onForget}>
              {t("login.forgetPassword")}
            </Link>
          </FormControl>
          {login_captcha && (
            <FormControl variant="standard" margin="normal" required fullWidth>
              <Captcha generation={captchaGen} required={true} fullWidth={true} onStateChange={setCaptchaState} />
            </FormControl>
          )}
          {control?.submit}
          {moreOptions && (
            <Divider sx={{ my: 2 }} role="presentation">
              <Typography variant="body2" color={"text.secondary"}>
                {t("login.or")}
              </Typography>
            </Divider>
          )}
        </>
      )}
      {!loginOptions?.password_enabled && (
        <Typography color={"text.secondary"} sx={{ mb: 2 }}>
          {t("login.paswordlessHint", { email: email })}
        </Typography>
      )}
      <Stack spacing={1}>
        {loginOptions?.webauthn_enabled && authn && <PasskeyLoginButton onLoginSuccess={onOAuthPasskeyLogin} />}
        {loginOptions?.sso_enabled && sso_enabled && (
          <OpenIDButton
            icon={sso_icon ? <CustomIcon sx={{ width: 20, height: 20 }} icon={sso_icon} /> : <BranchCompare />}
            name={sso_display_name ?? "vas.sso"}
            hint={email}
            provider={OpenIDProvider.logto}
          />
        )}
        {loginOptions?.qq_enabled && qq_enabled && (
          <OpenIDButton icon={<QQ />} name={"vas.qq"} provider={OpenIDProvider.qq} />
        )}
        {loginOptions?.oidc_enabled && oidc_enabled && (
          <OpenIDButton
            icon={oidc_icon ? <CustomIcon sx={{ width: 20, height: 20 }} icon={oidc_icon} /> : <BranchCompare />}
            name={oidc_display_name ?? "vas.sso"}
            provider={OpenIDProvider.oidc}
          />
        )}
      </Stack>
      {control?.back}
    </>
  );
};

export default PhaseCollectPassword;
