// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Add } from "@mui/icons-material";
import { Alert, Box, IconButton, Link, ListItemText, Menu, Stack, Typography } from "@mui/material";
import { bindMenu, bindTrigger } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import { useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import { PaymentProviderType, PaymentSetting } from "../../../../api/vas";
import { uuidv4 } from "../../../../util";
import { DenseFilledTextField, SecondaryButton } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";
import Dismiss from "../../../Icons/Dismiss";
import SettingForm from "../../../Pages/Setting/SettingForm";
import { NoMarginHelperText } from "../Settings";

export interface PaymentProviderProps {
  setting: PaymentSetting;
  onChange: (setting: PaymentSetting) => void;
}

const PaymentProviders: React.FC<PaymentProviderProps> = ({ setting, onChange }) => {
  const { t } = useTranslation("dashboard");
  const providerPopupState = usePopupState({
    variant: "popover",
    popupId: "providerSelector",
  });

  const updateProvider = useCallback(
    (id: string, newProvider: PaymentProvider) => {
      onChange({ ...setting, providers: setting.providers.map((p) => (p.id === id ? { ...p, ...newProvider } : p)) });
    },
    [onChange, setting],
  );

  const removeProvider = useCallback(
    (id: string) => {
      onChange({ ...setting, providers: setting.providers.filter((p) => p.id !== id) });
    },
    [onChange, setting],
  );

  const { onClose, ...restMenu } = bindMenu(providerPopupState);

  const addProvider = useCallback(
    (type: string) => {
      const newProvider = {
        id: uuidv4(),
        type: type,
        name: "",
        secret_key: "",
      };
      onChange({ ...setting, providers: [...setting.providers, newProvider] });
      onClose();
    },
    [onChange, onClose, setting],
  );

  return (
    <Stack spacing={2}>
      {setting.providers.map((provider) => (
        <Box
          key={provider.id}
          sx={{
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Stack spacing={3} flex={1}>
            <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
              <Typography fontWeight={600} color="textSecondary">
                {t(`settings.${provider.type}Provider`)}
              </Typography>
              <IconButton size="small" onClick={() => removeProvider(provider.id)}>
                <Dismiss fontSize="small" />
              </IconButton>
            </Stack>
            {provider.type == PaymentProviderType.custom && (
              <Alert severity="info">
                <Trans
                  i18nKey="settings.customProviderDes"
                  ns="dashboard"
                  components={[<Link target="_blank" href="https://docs.cloudreve.org/payment/custom" />]}
                />
              </Alert>
            )}
            <SettingForm title={t("settings.displayName")} lgWidth={12}>
              <DenseFilledTextField
                value={provider.name}
                onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                required
                fullWidth
              />
              <NoMarginHelperText>{t("settings.providerName")}</NoMarginHelperText>
            </SettingForm>
            {provider.type == PaymentProviderType.custom && (
              <>
                <SettingForm title={t("vas.customPaymentEndpoint")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.endpoint}
                    onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.customPaymentEndpointDes")}</NoMarginHelperText>
                </SettingForm>
                <SettingForm title={t("vas.communicationSecret")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.secret_key}
                    onChange={(e) => updateProvider(provider.id, { secret_key: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.customPaymentSecretDes")}</NoMarginHelperText>
                </SettingForm>
              </>
            )}
            {provider.type == PaymentProviderType.alipay && (
              <>
                <SettingForm title={t("vas.appID")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.app_id}
                    onChange={(e) => updateProvider(provider.id, { app_id: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.appIDDes")}</NoMarginHelperText>
                </SettingForm>
                <SettingForm title={t("vas.rsaPrivate")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.secret_key}
                    rows={4}
                    multiline
                    onChange={(e) => updateProvider(provider.id, { secret_key: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>
                    <Trans
                      i18nKey="vas.rsaPrivateDes"
                      ns="dashboard"
                      components={[<Link target="_blank" href="https://opendocs.alipay.com/common/02kipl" />]}
                    />
                  </NoMarginHelperText>
                </SettingForm>
                <SettingForm title={t("vas.alipayPublicKey")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.public_key}
                    rows={4}
                    multiline
                    onChange={(e) => updateProvider(provider.id, { public_key: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.alipayPublicKeyDes")}</NoMarginHelperText>
                </SettingForm>
              </>
            )}
            {provider.type == PaymentProviderType.weixin && (
              <>
                <SettingForm title={t("vas.applicationID")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.app_id}
                    onChange={(e) => updateProvider(provider.id, { app_id: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.applicationIDDes")}</NoMarginHelperText>
                </SettingForm>
                <SettingForm title={t("vas.merchantID")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.merchant_id}
                    onChange={(e) => updateProvider(provider.id, { merchant_id: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.merchantIDDes")}</NoMarginHelperText>
                </SettingForm>
                <SettingForm title={t("vas.apiV3Secret")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.secret_key}
                    onChange={(e) => updateProvider(provider.id, { secret_key: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.apiV3SecretDes")}</NoMarginHelperText>
                </SettingForm>
                <SettingForm title={t("vas.mcCertificateSerial")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.certificate_serial}
                    onChange={(e) => updateProvider(provider.id, { certificate_serial: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.mcCertificateSerialDes")}</NoMarginHelperText>
                </SettingForm>
                <SettingForm title={t("vas.mcAPISecret")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.api_private_key}
                    rows={4}
                    multiline
                    onChange={(e) => updateProvider(provider.id, { api_private_key: e.target.value })}
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("vas.mcAPISecretDes")}</NoMarginHelperText>
                </SettingForm>
              </>
            )}
            {provider.type == PaymentProviderType.stripe && (
              <>
                <SettingForm title={t("settings.providerKey")} lgWidth={12}>
                  <DenseFilledTextField
                    value={provider.secret_key}
                    onChange={(e) =>
                      updateProvider(provider.id, {
                        secret_key: e.target.value,
                      })
                    }
                    required
                    fullWidth
                  />
                  <NoMarginHelperText>{t("settings.providerKeyDes")}</NoMarginHelperText>
                </SettingForm>
              </>
            )}
          </Stack>
        </Box>
      ))}
      <Box>
        <SecondaryButton variant="contained" {...bindTrigger(providerPopupState)} startIcon={<Add />}>
          {t("settings.addPaymentProvider")}
        </SecondaryButton>
      </Box>
      <Menu
        onClose={onClose}
        {...restMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {[
          PaymentProviderType.stripe,
          PaymentProviderType.weixin,
          PaymentProviderType.alipay,
          PaymentProviderType.custom,
        ].map((type) => (
          <SquareMenuItem key={type} onClick={() => addProvider(type)}>
            <ListItemText
              slotProps={{
                primary: { variant: "body2" },
              }}
            >
              {t(`settings.${type}Provider`)}
            </ListItemText>
          </SquareMenuItem>
        ))}
      </Menu>
    </Stack>
  );
};

export default PaymentProviders;
