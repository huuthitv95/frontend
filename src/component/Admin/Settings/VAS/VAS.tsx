// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Trans, useTranslation } from "react-i18next";
import * as React from "react";
import { useCallback, useContext, useMemo, useState } from "react";
import { SettingContext } from "../SettingWrapper.tsx";
import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormControlLabel,
  IconButton,
  ListItemText,
  Stack,
  Switch,
  Typography,
  Autocomplete,
  Menu,
  Link,
  InputAdornment,
} from "@mui/material";
import { NoMarginHelperText, SettingSection, SettingSectionContent } from "../Settings.tsx";
import SettingForm from "../../../Pages/Setting/SettingForm.tsx";
import { DenseFilledTextField, DenseSelect, SecondaryButton } from "../../../Common/StyledComponents.tsx";
import { isTrueVal } from "../../../../session/utils.ts";
import DeleteIcon from "@mui/icons-material/Delete";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu.tsx";
import Add from "../../../Icons/Add.tsx";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import PaymentProviders from "./PaymentProviders.tsx";
import { PaymentSetting } from "../../../../api/vas.ts";
import StorageProducts from "./StorageProducts.tsx";
import GroupProducts from "./GroupProducts.tsx";
import GiftCodes from "./GiftCodes.tsx";

interface CurrencyOption {
  code: string;
  symbol: string;
  unit: number;
  label: string;
}

const commonCurrencies: CurrencyOption[] = [
  { code: "USD", symbol: "$", unit: 100, label: "US Dollar ($)" },
  { code: "EUR", symbol: "€", unit: 100, label: "Euro (€)" },
  { code: "GBP", symbol: "£", unit: 100, label: "British Pound (£)" },
  { code: "JPY", symbol: "¥", unit: 1, label: "Japanese Yen (¥)" },
  { code: "CNY", symbol: "¥", unit: 100, label: "Chinese Yuan (¥)" },
  { code: "HKD", symbol: "$", unit: 100, label: "Hong Kong Dollar ($)" },
  { code: "SGD", symbol: "$", unit: 100, label: "Singapore Dollar ($)" },
  { code: "KRW", symbol: "₩", unit: 1, label: "Korean Won (₩)" },
  { code: "INR", symbol: "₹", unit: 100, label: "Indian Rupee (₹)" },
  { code: "RUB", symbol: "₽", unit: 100, label: "Russian Ruble (₽)" },
  { code: "BRL", symbol: "R", unit: 100, label: "Brazilian Real (R)" },
  { code: "AUD", symbol: "$", unit: 100, label: "Australian Dollar ($)" },
  { code: "CAD", symbol: "$", unit: 100, label: "Canadian Dollar ($)" },
  { code: "CHF", symbol: "F", unit: 100, label: "Swiss Franc (F)" },
];

const VAS = () => {
  const { t } = useTranslation("dashboard");
  const { formRef, setSettings, values } = useContext(SettingContext);
  const currencyPopupState = usePopupState({
    variant: "popover",
    popupId: "currencySelector",
  });
  const paymentConfig = useMemo(() => JSON.parse(values.payment || "{}"), [values.payment]);
  const storageProducts = useMemo(() => values.storage_products || "[]", [values.storage_products]);
  const groupSellData = useMemo(() => values.group_sell_data || "[]", [values.group_sell_data]);

  const updatePaymentConfig = useCallback(
    (newConfig: PaymentSetting) => {
      setSettings({
        payment: JSON.stringify(newConfig),
      });
    },
    [setSettings],
  );

  const handleCurrencySelect = (currency: CurrencyOption) => {
    updatePaymentConfig({
      ...paymentConfig,
      currency_code: currency.code,
      currency_mark: currency.symbol,
      currency_unit: currency.unit,
    });
    currencyPopupState.close();
  };

  const onStorageProductsChange = useCallback(
    (newConfig: string) => {
      setSettings({
        storage_products: newConfig,
      });
    },
    [setSettings],
  );

  const onGroupSellDataChange = useCallback(
    (newConfig: string) => {
      setSettings({
        group_sell_data: newConfig,
      });
    },
    [setSettings],
  );

  return (
    <Box component={"form"} ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <Stack spacing={5}>
        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("settings.creditAndVAS")}
          </Typography>
          <SettingSectionContent>
            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isTrueVal(values.score_enabled)}
                      onChange={(e) =>
                        setSettings({
                          score_enabled: e.target.checked ? "1" : "0",
                        })
                      }
                    />
                  }
                  label={t("settings.enableCredit")}
                />
                <NoMarginHelperText>{t("settings.enableCreditDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <Collapse in={isTrueVal(values.score_enabled)}>
              <Stack spacing={2}>
                <SettingForm title={t("settings.creditPrice")} lgWidth={5}>
                  <FormControl fullWidth>
                    <DenseFilledTextField
                      type="number"
                      inputProps={{ min: 0 }}
                      value={values.score_price}
                      onChange={(e) =>
                        setSettings({
                          score_price: e.target.value,
                        })
                      }
                      required
                    />
                    <NoMarginHelperText>{t("settings.creditPriceDes")}</NoMarginHelperText>
                  </FormControl>
                </SettingForm>

                <SettingForm title={t("settings.shareScoreRate")} lgWidth={5}>
                  <FormControl fullWidth>
                    <DenseFilledTextField
                      type="number"
                      inputProps={{ min: 1, max: 100 }}
                      value={values.share_score_rate}
                      onChange={(e) =>
                        setSettings({
                          share_score_rate: e.target.value,
                        })
                      }
                      required
                    />
                    <NoMarginHelperText>{t("settings.shareScoreRateDes")}</NoMarginHelperText>
                  </FormControl>
                </SettingForm>
              </Stack>
            </Collapse>

            <SettingForm title={t("vas.banBufferPeriod")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  type="number"
                  inputProps={{ min: 0 }}
                  value={values.ban_time}
                  onChange={(e) =>
                    setSettings({
                      ban_time: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("vas.banBufferPeriodDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.cronNotifyUser")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={values.cron_notify_user}
                  onChange={(e) =>
                    setSettings({
                      cron_notify_user: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey="settings.cronDes"
                    values={{
                      des: t("settings.cronNotifyUserDes"),
                    }}
                    ns={"dashboard"}
                    components={[<Link href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" />]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.cronBanUser")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={values.cron_ban_user}
                  onChange={(e) =>
                    setSettings({
                      cron_ban_user: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>
                  <Trans
                    i18nKey="settings.cronDes"
                    values={{
                      des: t("settings.cronBanUserDes"),
                    }}
                    ns={"dashboard"}
                    components={[<Link href="https://crontab.guru/" target="_blank" rel="noopener noreferrer" />]}
                  />
                </NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isTrueVal(values.anonymous_purchase)}
                      onChange={(e) =>
                        setSettings({
                          anonymous_purchase: e.target.checked ? "1" : "0",
                        })
                      }
                    />
                  }
                  label={t("settings.anonymousPurchase")}
                />
                <NoMarginHelperText>{t("settings.anonymousPurchaseDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm lgWidth={5}>
              <FormControl fullWidth>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isTrueVal(values.shop_nav_enabled)}
                      onChange={(e) =>
                        setSettings({
                          shop_nav_enabled: e.target.checked ? "1" : "0",
                        })
                      }
                    />
                  }
                  label={t("settings.shopNavEnabled")}
                />
                <NoMarginHelperText>{t("settings.shopNavEnabledDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </SettingSectionContent>
        </SettingSection>

        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("settings.paymentSettings")}
          </Typography>
          <SettingSectionContent>
            <Menu
              {...bindMenu(currencyPopupState)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
            >
              {commonCurrencies.map((currency) => (
                <SquareMenuItem key={currency.code} onClick={() => handleCurrencySelect(currency)}>
                  <ListItemText
                    slotProps={{
                      primary: { variant: "body2" },
                    }}
                  >
                    {currency.label}
                  </ListItemText>
                </SquareMenuItem>
              ))}
            </Menu>

            <SettingForm title={t("settings.currencyCode")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={paymentConfig.currency_code}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button {...bindTrigger(currencyPopupState)}>{t("settings.selectCurrency")}</Button>
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) =>
                    updatePaymentConfig({
                      ...paymentConfig,
                      currency_code: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("settings.currencyCodeDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.currencySymbol")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  value={paymentConfig.currency_mark}
                  onChange={(e) =>
                    updatePaymentConfig({
                      ...paymentConfig,
                      currency_mark: e.target.value,
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("settings.currencySymbolDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <SettingForm title={t("settings.currencyUnit")} lgWidth={5}>
              <FormControl fullWidth>
                <DenseFilledTextField
                  type="number"
                  inputProps={{ min: 1 }}
                  value={paymentConfig.currency_unit}
                  onChange={(e) =>
                    updatePaymentConfig({
                      ...paymentConfig,
                      currency_unit: parseInt(e.target.value),
                    })
                  }
                  required
                />
                <NoMarginHelperText>{t("settings.currencyUnitDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t("settings.paymentProviders")}
              </Typography>
              <SettingForm lgWidth={6}>
                <PaymentProviders setting={paymentConfig} onChange={updatePaymentConfig} />
              </SettingForm>
            </Box>
          </SettingSectionContent>
        </SettingSection>

        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("settings.storageProductSettings")}
          </Typography>
          <SettingSectionContent>
            <SettingForm lgWidth={12}>
              <FormControl fullWidth>
                <StorageProducts
                  config={storageProducts}
                  onChange={onStorageProductsChange}
                  currencySymbol={paymentConfig.currency_mark || "$"}
                  currencyUnit={paymentConfig.currency_unit || 100}
                />
                <NoMarginHelperText>{t("settings.storageProductsDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </SettingSectionContent>
        </SettingSection>

        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("settings.groupProductSettings")}
          </Typography>
          <SettingSectionContent>
            <SettingForm lgWidth={12}>
              <FormControl fullWidth>
                <GroupProducts
                  config={groupSellData}
                  onChange={onGroupSellDataChange}
                  currencySymbol={paymentConfig.currency_mark || "$"}
                  currencyUnit={paymentConfig.currency_unit || 100}
                />
                <NoMarginHelperText>{t("settings.groupProductsDes")}</NoMarginHelperText>
              </FormControl>
            </SettingForm>
          </SettingSectionContent>
        </SettingSection>

        <SettingSection>
          <Typography variant="h6" gutterBottom>
            {t("giftCodes.giftCodesSettings")}
          </Typography>
          <SettingSectionContent>
            <GiftCodes storageProductsConfig={storageProducts} groupProductsConfig={groupSellData} />
          </SettingSectionContent>
        </SettingSection>
      </Stack>
    </Box>
  );
};

export default VAS;
