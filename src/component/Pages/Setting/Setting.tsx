// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import PageHeader, { PageTabQuery } from "../PageHeader.tsx";
import { Box, Container } from "@mui/material";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ResponsiveTabs, { Tab } from "../../Common/ResponsiveTabs.tsx";
import { useAppDispatch } from "../../../redux/hooks.ts";
import { useQueryState } from "nuqs";
import { PersonOutline } from "@mui/icons-material";
import EditSetting from "../../Icons/EditSetting.tsx";
import LockClosedOutlined from "../../Icons/LockClosedOutlined.tsx";
import StorageOutlined from "../../Icons/StorageOutlined.tsx";
import Currency from "../../Icons/Currency.tsx";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import FacebookCircularProgress from "../../Common/CircularProgress.tsx";
import { getUserSettings } from "../../../api/api.ts";
import { UserSettings } from "../../../api/user.ts";
import ProfileSetting from "./ProfileSetting.tsx";
import PreferenceSetting from "./PreferenceSetting.tsx";
import SecuritySetting from "./Security/SecuritySetting.tsx";
import { loadSiteConfig } from "../../../redux/thunks/site.ts";
import StorageSetting from "./StorageSetting.tsx";
import FinanceSetting from "./Finance/FinanceSetting.tsx";
import PageContainer from "../PageContainer.tsx";

export enum SettingPageTab {
  Profile = "profile",
  Preference = "preference",
  Finance = "finance",
  Security = "security",
  Storage = "storage",
}

const Setting = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [tab, setTab] = useQueryState(PageTabQuery);
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState<UserSettings | undefined>(undefined);

  useEffect(() => {
    setLoading(true);
    dispatch(loadSiteConfig("login"));
    dispatch(getUserSettings())
      .then((res) => {
        setSetting(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const tabs: Tab<SettingPageTab>[] = useMemo(() => {
    const res = [];
    res.push(
      ...[
        {
          label: t("application:setting.profile"),
          value: SettingPageTab.Profile,
          icon: <PersonOutline />,
        },
        {
          label: t("application:setting.preference"),
          value: SettingPageTab.Preference,
          icon: <EditSetting />,
        },
        {
          label: t("application:setting.security"),
          value: SettingPageTab.Security,
          icon: <LockClosedOutlined />,
        },
        {
          label: t("application:navbar.storage"),
          value: SettingPageTab.Storage,
          icon: <StorageOutlined />,
        },
        {
          label: t("application:setting.finance"),
          value: SettingPageTab.Finance,
          icon: <Currency />,
        },
      ],
    );
    return res;
  }, [t]);

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <PageHeader title={t("application:navbar.setting")} />
        <ResponsiveTabs
          value={tab ?? SettingPageTab.Profile}
          onChange={(_e, newValue) => setTab(newValue)}
          tabs={tabs}
        />
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
                    pt: 20,
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FacebookCircularProgress />
                </Box>
              )}
              {!loading && setting && (
                <Box
                  sx={{
                    mt: 3,
                  }}
                >
                  {(!tab || tab == SettingPageTab.Profile) && (
                    <ProfileSetting setting={setting} setSetting={setSetting} />
                  )}
                  {tab == SettingPageTab.Preference && <PreferenceSetting setting={setting} setSetting={setSetting} />}
                  {tab == SettingPageTab.Security && <SecuritySetting setting={setting} setSetting={setSetting} />}
                  {tab == SettingPageTab.Storage && <StorageSetting setting={setting} />}
                  {tab == SettingPageTab.Finance && <FinanceSetting setting={setting} setSetting={setSetting} />}
                </Box>
              )}
            </Box>
          </CSSTransition>
        </SwitchTransition>
      </Container>
    </PageContainer>
  );
};

export default Setting;
