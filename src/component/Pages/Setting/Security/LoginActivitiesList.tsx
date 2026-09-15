// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Table, TableBody, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LoginActivity, OpenIDProvider, UserSettings } from "../../../../api/user.ts";
import { useAppSelector } from "../../../../redux/hooks.ts";
import CustomIcon from "../../../Common/CustomIcon.tsx";
import {
  NoWrapCell,
  NoWrapTableCell,
  SquareChip,
  StyledTableContainerPaper,
} from "../../../Common/StyledComponents.tsx";
import TimeBadge from "../../../Common/TimeBadge.tsx";
import { CellHeaderWithPadding } from "../../../FileManager/Dialogs/LockConflictDetails.tsx";
import BranchCompare from "../../../Icons/BranchCompare.tsx";
import Fingerprint from "../../../Icons/Fingerprint.tsx";
import Password from "../../../Icons/Password.tsx";
import PhoneLaptopOutlined from "../../../Icons/PhoneLaptopOutlined.tsx";
import QQ from "../../../Icons/QQ.tsx";

const LoginActivityRow = ({ loginActivity }: { loginActivity: LoginActivity }) => {
  const { t } = useTranslation();
  const { sso_display_name, oidc_display_name, sso_icon, oidc_icon } = useAppSelector(
    (state) => state.siteConfig.login.config,
  );
  const loginWith = useMemo(() => {
    if (loginActivity.webdav) {
      return (
        <>
          <PhoneLaptopOutlined />
          {t("modals.webdav")}
        </>
      );
    }

    switch (loginActivity.login_with) {
      case "passkey":
        return (
          <>
            <Fingerprint />
            {t("setting.loginWithPasskey", { name: loginActivity.passkey })}
          </>
        );
      case "openid":
        switch (loginActivity.open_id_provider) {
          case OpenIDProvider.qq:
            return (
              <>
                <QQ />
                {t("vas.qq")}
              </>
            );
          case OpenIDProvider.logto:
            return (
              <>
                {sso_icon ? <CustomIcon icon={sso_icon} /> : <BranchCompare />}
                {sso_display_name ? t(sso_display_name) : t("vas.sso")}
              </>
            );
          case OpenIDProvider.oidc:
            return (
              <>
                {oidc_icon ? <CustomIcon icon={oidc_icon} /> : <BranchCompare />}
                {oidc_display_name ?? t("vas.sso")}
              </>
            );
          default:
            return null;
        }

      default:
        return (
          <>
            <Password />
            {t("login.password")}
          </>
        );
    }
  }, [loginActivity, t]);
  return (
    <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <NoWrapCell>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {loginWith}
        </Box>
      </NoWrapCell>
      <NoWrapCell>
        <SquareChip
          color={loginActivity.success ? "success" : "error"}
          size={"small"}
          label={t(`setting.${loginActivity.success ? "success" : "failed"}`)}
        />
      </NoWrapCell>
      <NoWrapCell>{`${loginActivity.browser} - ${loginActivity.os} - ${loginActivity.device}`}</NoWrapCell>
      <NoWrapCell>{loginActivity.ip}</NoWrapCell>
      <NoWrapCell>
        <TimeBadge datetime={loginActivity.created_at} variant={"inherit"} />
      </NoWrapCell>
    </TableRow>
  );
};

export interface LoginActivitiesListProps {
  settings: UserSettings;
}

const LoginActivitiesList = ({ settings }: LoginActivitiesListProps) => {
  const { t } = useTranslation();
  return (
    <TableContainer sx={{ mt: 1 }} component={StyledTableContainerPaper}>
      <Table sx={{ width: "100%" }} size="small">
        <TableHead>
          <TableRow>
            <NoWrapTableCell>{t("setting.loginWith")}</NoWrapTableCell>
            <NoWrapTableCell>
              <CellHeaderWithPadding>{t("setting.result")}</CellHeaderWithPadding>
            </NoWrapTableCell>
            <NoWrapTableCell>{t("setting.device")}</NoWrapTableCell>
            <NoWrapTableCell>{t("setting.ip")}</NoWrapTableCell>
            <NoWrapTableCell>{t("setting.time")}</NoWrapTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {settings.login_activity?.map((loginActivity, index) => (
            <LoginActivityRow key={index} loginActivity={loginActivity} />
          ))}
        </TableBody>
      </Table>
      {!settings.login_activity && (
        <Box sx={{ p: 1, width: "100%", textAlign: "center" }}>
          <Typography variant={"caption"} color={"text.secondary"}>
            {t("application:setting.listEmpty")}
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default LoginActivitiesList;
