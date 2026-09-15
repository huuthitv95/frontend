// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { AddRounded, DeleteOutlineRounded, ExpandMoreRounded } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  Alert,
  Box,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  styled,
  Switch,
  useTheme,
} from "@mui/material";
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary";
import FormControl from "@mui/material/FormControl";
import { lazy, Suspense, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { LogtoConfig, OIDCConfig, QQConnectConfig } from "../../../../api/dashboard.ts";
import { isTrueVal } from "../../../../session/utils.ts";
import CircularProgress from "../../../Common/CircularProgress.tsx";
import { Code } from "../../../Common/Code.tsx";
import { DenseFilledTextField, SecondaryButton, StyledCheckbox } from "../../../Common/StyledComponents.tsx";
import SettingForm from "../../../Pages/Setting/SettingForm.tsx";
import GroupSelectionInput from "../../Common/GroupSelectionInput.tsx";
import { NoMarginHelperText } from "../Settings.tsx";
import ImportOidcDialog from "./ImportOidcDialog.tsx";

const MonacoEditor = lazy(() => import("../../../Viewers/CodeViewer/MonacoEditor.tsx"));

export const AccordionSummary = styled((props: AccordionSummaryProps) => <MuiAccordionSummary {...props} />)(
  ({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    paddingLeft: theme.spacing(4),
    "& .MuiFormControlLabel-label": {
      fontSize: theme.typography.body2.fontSize,
    },
    "& .MuiCheckbox-root": {
      marginRight: theme.spacing(2),
    },
  }),
);

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: "none",
  border: `1px solid ${theme.palette.divider}`,
  "&::before": {
    display: "none",
  },
}));

export interface SettingSectionProps {
  values: {
    [key: string]: string;
  };
  onChange: (values: { [key: string]: string }) => void;
}

const userInfoFields = [
  {
    label: "settings.oidcSubField",
    key: "sub_field_mapping",
    placeholder: "sub",
  },
  {
    label: "settings.oidcEmailField",
    key: "email_field_mapping",
    placeholder: "email",
  },
  {
    label: "settings.oidcAvatarField",
    key: "avatar_field_mapping",
    placeholder: "picture",
  },
  {
    label: "settings.oidcNameField",
    key: "name_field_mapping",
    placeholder: "name",
  },
];

const SSOSettings = ({ values, onChange }: SettingSectionProps) => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const [openImportOidcDialog, setOpenImportOidcDialog] = useState(false);

  const qqConfig = useMemo((): QQConnectConfig => {
    return values.qq_login_config ? JSON.parse(values.qq_login_config) : {};
  }, [values.qq_login_config]);
  const logtoConfig = useMemo((): LogtoConfig => {
    return values.logto_config ? JSON.parse(values.logto_config) : {};
  }, [values.logto_config]);
  const oidcConfig = useMemo((): OIDCConfig => {
    return values.oidc_config ? JSON.parse(values.oidc_config) : {};
  }, [values.oidc_config]);

  return (
    <>
      <ImportOidcDialog
        open={openImportOidcDialog}
        onClose={() => setOpenImportOidcDialog(false)}
        onImported={(v) => onChange({ oidc_wellknown: v })}
      />
      <StyledAccordion
        TransitionProps={{ unmountOnExit: true }}
        defaultExpanded={isTrueVal(values.qq_login)}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
          <FormControlLabel
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            control={
              <StyledCheckbox
                size={"small"}
                checked={isTrueVal(values.qq_login)}
                onChange={(e) =>
                  onChange({
                    qq_login: e.target.checked ? "1" : "0",
                  })
                }
              />
            }
            label={t("vas.qqConnect")}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ display: "block" }}>
          <Stack spacing={2}>
            <Alert severity="info">
              <Trans
                i18nKey={"vas.qqConnectHint"}
                ns={"dashboard"}
                values={{
                  url: window.location.origin.endsWith("/")
                    ? `${window.location.origin}login/qq`
                    : `${window.location.origin}/login/qq`,
                }}
                components={[<Link href={"https://connect.qq.com/"} target={"_blank"} />]}
              />
            </Alert>
            <SettingForm lgWidth={12} spacing={0} title={t("vas.appid")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={qqConfig.app_id}
                  onChange={(e) =>
                    onChange({
                      qq_login_config: JSON.stringify({
                        ...qqConfig,
                        app_id: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.qq_login)}
                />
                <NoMarginHelperText>{t("vas.appidDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("vas.appKey")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={qqConfig.app_secret}
                  onChange={(e) =>
                    onChange({
                      qq_login_config: JSON.stringify({
                        ...qqConfig,
                        app_secret: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.qq_login)}
                />
                <NoMarginHelperText>{t("vas.appKeyDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={qqConfig.direct_sign_in}
                      onChange={(e) =>
                        onChange({
                          qq_login_config: JSON.stringify({
                            ...qqConfig,
                            direct_sign_in: e.target.checked,
                          }),
                        })
                      }
                    />
                  }
                  label={t("vas.loginWithoutBinding")}
                />
                <NoMarginHelperText>{t("vas.loginWithoutBindingDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </Stack>
        </AccordionDetails>
      </StyledAccordion>
      <StyledAccordion
        TransitionProps={{ unmountOnExit: true }}
        defaultExpanded={isTrueVal(values.logto_enabled)}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
          <FormControlLabel
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            control={
              <StyledCheckbox
                size={"small"}
                checked={isTrueVal(values.logto_enabled)}
                onChange={(e) =>
                  onChange({
                    logto_enabled: e.target.checked ? "1" : "0",
                  })
                }
              />
            }
            label={t("settings.logto")}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ display: "block" }}>
          <Stack spacing={2}>
            <Alert severity="info">
              <Trans
                i18nKey={"settings.logtoDes"}
                ns={"dashboard"}
                values={{
                  url: window.location.origin.endsWith("/")
                    ? `${window.location.origin}callback/openid/0`
                    : `${window.location.origin}/callback/openid/0`,
                }}
                components={[<Link href={"https://logto.io/"} target={"_blank"} />, <Code />]}
              />
            </Alert>
            <SettingForm lgWidth={12} spacing={0} title={t("vas.appid")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={logtoConfig.app_id ?? ""}
                  onChange={(e) =>
                    onChange({
                      logto_config: JSON.stringify({
                        ...logtoConfig,
                        app_id: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.logto_enabled)}
                />
                <NoMarginHelperText>{t("settings.logtoAppIDDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.logtoKey")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={logtoConfig.app_secret ?? ""}
                  onChange={(e) =>
                    onChange({
                      logto_config: JSON.stringify({
                        ...logtoConfig,
                        app_secret: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.logto_enabled)}
                />
                <NoMarginHelperText>{t("settings.logtoKeyDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.logtoDirectSSO")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={logtoConfig.direct_sso}
                  placeholder={"e.g. social:google"}
                  onChange={(e) =>
                    onChange({
                      logto_config: JSON.stringify({
                        ...logtoConfig,
                        direct_sso: e.target.value,
                      }),
                    })
                  }
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey={"settings.logtoDirectSSODes"}
                    ns={"dashboard"}
                    components={[
                      <Link
                        href={"https://docs.logto.io/end-user-flows/authentication-parameters/direct-sign-in"}
                        target={"_blank"}
                      />,
                    ]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.logtoEndpoint")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={logtoConfig.endpoint ?? ""}
                  onChange={(e) =>
                    onChange({
                      logto_config: JSON.stringify({
                        ...logtoConfig,
                        endpoint: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.logto_enabled)}
                />
                <NoMarginHelperText>{t("settings.logtoEndpointDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.logtoName")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={logtoConfig.display_name}
                  onChange={(e) =>
                    onChange({
                      logto_config: JSON.stringify({
                        ...logtoConfig,
                        display_name: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.logto_enabled)}
                />
                <NoMarginHelperText>{t("settings.logtoNameDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.icon")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={logtoConfig.icon}
                  onChange={(e) =>
                    onChange({
                      logto_config: JSON.stringify({
                        ...logtoConfig,
                        icon: e.target.value === "" ? undefined : e.target.value,
                      }),
                    })
                  }
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey={"settings.ssoIconDes"}
                    ns={"dashboard"}
                    components={[<Link href="https://icon-sets.iconify.design/" target="_blank" />]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={logtoConfig.direct_sign_in}
                      onChange={(e) =>
                        onChange({
                          logto_config: JSON.stringify({
                            ...logtoConfig,
                            direct_sign_in: e.target.checked,
                          }),
                        })
                      }
                    />
                  }
                  label={t("vas.loginWithoutBinding")}
                />
                <NoMarginHelperText>{t("vas.loginWithoutBindingDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </Stack>
        </AccordionDetails>
      </StyledAccordion>
      <StyledAccordion
        TransitionProps={{ unmountOnExit: true }}
        defaultExpanded={isTrueVal(values.oidc_enabled)}
        disableGutters
      >
        <AccordionSummary expandIcon={<ExpandMoreRounded />}>
          <FormControlLabel
            onClick={(event) => event.stopPropagation()}
            onFocus={(event) => event.stopPropagation()}
            control={
              <StyledCheckbox
                size={"small"}
                onChange={(e) => onChange({ oidc_enabled: e.target.checked ? "1" : "0" })}
                checked={isTrueVal(values.oidc_enabled)}
              />
            }
            label={t("settings.oidc")}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ display: "block" }}>
          <Stack spacing={2}>
            <Alert severity="info">
              <Trans
                i18nKey={"settings.oidcDes"}
                ns={"dashboard"}
                values={{
                  url: window.location.origin.endsWith("/")
                    ? `${window.location.origin}callback/openid/2`
                    : `${window.location.origin}/callback/openid/2`,
                }}
                components={[<Code />, <Link href="https://docs.cloudreve.org/usage/oidc" target="_blank" />]}
              />
            </Alert>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.clientID")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={oidcConfig.client_id ?? ""}
                  onChange={(e) =>
                    onChange({
                      oidc_config: JSON.stringify({
                        ...oidcConfig,
                        client_id: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.oidc_enabled)}
                />
                <NoMarginHelperText>{t("settings.clientIDDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.clientSecret")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={oidcConfig.client_secret ?? ""}
                  onChange={(e) =>
                    onChange({
                      oidc_config: JSON.stringify({
                        ...oidcConfig,
                        client_secret: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.oidc_enabled)}
                />
                <NoMarginHelperText>{t("settings.clientSecretDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.scope")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={oidcConfig.scope ?? ""}
                  onChange={(e) =>
                    onChange({
                      oidc_config: JSON.stringify({ ...oidcConfig, scope: e.target.value }),
                    })
                  }
                />
                <NoMarginHelperText>
                  <Trans i18nKey={"settings.scopeDes"} ns={"dashboard"} components={[<Code />]} />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm noContainer title={t("settings.oidcWellknown")} lgWidth={12}>
              <SecondaryButton
                variant="contained"
                color="primary"
                sx={{ mb: 1 }}
                onClick={() => setOpenImportOidcDialog(true)}
              >
                {t("settings.importFromWellknown")}
              </SecondaryButton>
              <Suspense fallback={<CircularProgress />}>
                <MonacoEditor
                  theme={theme.palette.mode === "dark" ? "vs-dark" : "vs"}
                  value={values.oidc_wellknown ?? ""}
                  height={"300px"}
                  minHeight={"300px"}
                  language={"json"}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                  }}
                  onChange={(e) => onChange({ oidc_wellknown: e as string })}
                />
              </Suspense>
              <NoMarginHelperText>{t("settings.oidcWellknownDes")}</NoMarginHelperText>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.logtoName")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={oidcConfig.display_name}
                  onChange={(e) =>
                    onChange({
                      oidc_config: JSON.stringify({
                        ...oidcConfig,
                        display_name: e.target.value,
                      }),
                    })
                  }
                  required={isTrueVal(values.oidc_enabled)}
                />
                <NoMarginHelperText>{t("settings.logtoNameDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.icon")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={oidcConfig.icon}
                  onChange={(e) =>
                    onChange({
                      oidc_config: JSON.stringify({
                        ...oidcConfig,
                        icon: e.target.value === "" ? undefined : e.target.value,
                      }),
                    })
                  }
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey={"settings.ssoIconDes"}
                    ns={"dashboard"}
                    components={[<Link href="https://icon-sets.iconify.design/" target="_blank" />]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={oidcConfig.direct_sign_in}
                      onChange={(e) =>
                        onChange({
                          oidc_config: JSON.stringify({
                            ...oidcConfig,
                            direct_sign_in: e.target.checked,
                          }),
                        })
                      }
                    />
                  }
                  label={t("vas.loginWithoutBinding")}
                />
                <NoMarginHelperText>{t("vas.loginWithoutBindingDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.oidcUserInfoFieldsMapping")}>
              <FormControl fullWidth>
                {userInfoFields.map((field) => (
                  <DenseFilledTextField
                    key={field.key}
                    value={oidcConfig[field.key as keyof OIDCConfig] || ""}
                    onChange={(e) =>
                      onChange({
                        oidc_config: JSON.stringify({
                          ...oidcConfig,
                          [field.key]: e.target.value === "" ? undefined : e.target.value,
                        }),
                      })
                    }
                    placeholder={field.placeholder}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">{t(field.label)}:</InputAdornment>,
                      },
                    }}
                    sx={{ mb: 1 }}
                  />
                ))}
                <NoMarginHelperText>
                  <Trans
                    i18nKey={"settings.oidcUserInfoFieldsMappingDes"}
                    ns={"dashboard"}
                    components={[
                      <Link href="https://github.com/tidwall/gjson/blob/master/SYNTAX.md" target="_blank" />,
                    ]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.oidcGroupField")}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={oidcConfig.group_field_mapping ?? ""}
                  onChange={(e) =>
                    onChange({
                      oidc_config: JSON.stringify({
                        ...oidcConfig,
                        group_field_mapping: e.target.value === "" ? undefined : e.target.value,
                      }),
                    })
                  }
                  placeholder={"groups"}
                />
                <NoMarginHelperText>{t("settings.oidcGroupFieldDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
            <SettingForm lgWidth={12} spacing={0} title={t("settings.oidcGroupMapping")}>
              <OidcGroupMappingInput
                value={oidcConfig.group_mapping}
                onChange={(group_mapping) =>
                  onChange({
                    oidc_config: JSON.stringify({
                      ...oidcConfig,
                      group_mapping,
                    }),
                  })
                }
              />
              <NoMarginHelperText>{t("settings.oidcGroupMappingDes")}</NoMarginHelperText>
            </SettingForm>
          </Stack>
        </AccordionDetails>
      </StyledAccordion>
    </>
  );
};

interface OidcGroupMappingInputProps {
  value?: Record<string, number>;
  onChange: (next?: Record<string, number>) => void;
}

const OidcGroupMappingInput = ({ value, onChange }: OidcGroupMappingInputProps) => {
  const { t } = useTranslation("dashboard");
  // Track entries as ordered tuples so users can edit blank keys without
  // losing focus or colliding on duplicate keys.
  const [rows, setRows] = useState<{ key: string; groupID: string }[]>(() =>
    Object.entries(value ?? {}).map(([k, v]) => ({ key: k, groupID: String(v) })),
  );

  const commit = (next: { key: string; groupID: string }[]) => {
    setRows(next);
    const obj: Record<string, number> = {};
    for (const row of next) {
      if (row.key === "" || row.groupID === "") continue;
      const gid = parseInt(row.groupID, 10);
      if (!Number.isNaN(gid)) obj[row.key] = gid;
    }
    onChange(Object.keys(obj).length > 0 ? obj : undefined);
  };

  return (
    <Stack spacing={1}>
      {rows.map((row, index) => (
        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DenseFilledTextField
            sx={{ flex: 1 }}
            placeholder={t("settings.oidcGroupMappingValue")}
            value={row.key}
            onChange={(e) => {
              const next = [...rows];
              next[index] = { ...next[index], key: e.target.value };
              commit(next);
            }}
          />
          <Box sx={{ flex: 1 }}>
            <GroupSelectionInput
              fullWidth
              value={row.groupID}
              onChange={(v) => {
                const next = [...rows];
                next[index] = { ...next[index], groupID: v };
                commit(next);
              }}
            />
          </Box>
          <IconButton
            size="small"
            onClick={() => {
              const next = rows.filter((_, i) => i !== index);
              commit(next);
            }}
          >
            <DeleteOutlineRounded fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <SecondaryButton
        variant="contained"
        startIcon={<AddRounded />}
        onClick={() => commit([...rows, { key: "", groupID: "" }])}
        sx={{ alignSelf: "flex-start" }}
      >
        {t("settings.oidcGroupMappingAdd")}
      </SecondaryButton>
    </Stack>
  );
};

export default SSOSettings;
