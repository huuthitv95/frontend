// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { LoadingButton } from "@mui/lab";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { getPaymentStatus, sendCreatePayment } from "../../api/api.ts";
import { CreatePaymentResponse, Payment, PaymentProvider, PaymentStatus, ProductParameter } from "../../api/vas.ts";
import i18next from "../../i18n.ts";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import { ConfigLoadState } from "../../redux/siteConfigSlice.ts";
import SessionManager from "../../session";
import CircularProgress from "../Common/CircularProgress.tsx";
import { OutlineIconTextField } from "../Common/Form/OutlineIconTextField.tsx";
import { PriceChip } from "../FileManager/PurchaseRequiredError.tsx";
import CheckmarkCircle from "../Icons/CheckmarkCircle.tsx";
import MailOutlined from "../Icons/MailOutlined.tsx";
import WalletCreditCard from "../Icons/WalletCreditCard.tsx";

export interface PaymentWizardProps {
  product: ProductParameter;
  quantity: number;
  pointPrice?: number;
  showPointsProvider?: boolean;
  pointsProviderOnly?: boolean;
  onPaymentCompleted?: (payment: Payment) => void;
}

enum PaymentWizardStep {
  loading,
  form,
  payment,
  success,
  error,
}

interface ExtendedPaymentProviders extends PaymentProvider {
  points?: number;
}

const PaymentWizard = (props: PaymentWizardProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { product, onPaymentCompleted, quantity, showPointsProvider, pointsProviderOnly, pointPrice } = props;
  const { payment } = useAppSelector((state) => state.siteConfig.vas.config);
  const vasLoading = useAppSelector((state) => state.siteConfig.vas.loaded);

  const [step, setStep] = useState<PaymentWizardStep>(PaymentWizardStep.loading);
  const [email, setEmail] = useState("");
  const [providerId, setProviderId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [checkLoading, setCheckLoading] = useState(false);
  const createPaymentRes = useRef<CreatePaymentResponse | undefined>(undefined);
  const checkLoop = useRef<NodeJS.Timeout | undefined>(undefined);

  const user = useMemo(() => SessionManager.currentLoginOrNull(), []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const createPayment = (providerIdOverwrite?: string) => {
    if (!payment) {
      return;
    }
    setStep(PaymentWizardStep.loading);
    dispatch(
      sendCreatePayment({
        product,
        quantity,
        email,
        provider_id: (providerIdOverwrite ? providerIdOverwrite : providerId)?.replace(" ", ""),
        language: i18next.language,
      }),
    )
      .then((res) => {
        createPaymentRes.current = res;
        if (!res.request.payment_needed) {
          checkPayment();
          return;
        }
        setStep(PaymentWizardStep.payment);
        if (!res.request.qr_code_preferred) {
          window.open(res.request.url, "_blank");
        }

        checkLoop.current = setInterval(checkPayment, 10000);
      })
      .catch((err) => {
        setStep(PaymentWizardStep.error);
        setError(err.message);
      });
  };

  const providers = useMemo(() => {
    let providers: ExtendedPaymentProviders[] = payment?.providers ? [...payment?.providers] : [];
    if (pointsProviderOnly) {
      providers = [];
    }
    if (showPointsProvider || pointsProviderOnly) {
      providers.push({
        id: " ",
        type: "points",
        name: t("application:vas.payWithPoints"),
        points: pointPrice,
      });
    }
    return providers;
  }, [payment, showPointsProvider, pointsProviderOnly, quantity, pointPrice]);

  useEffect(() => {
    if (!payment) {
      setStep(PaymentWizardStep.loading);
      return;
    }

    createPaymentRes.current = undefined;
    if (providers.length == 1 && user) {
      // only one provider, directly create payment
      setStep(PaymentWizardStep.loading);
      createPayment(providers[0].id);
      return;
    }

    if (payment.providers.length == 0) {
      setStep(PaymentWizardStep.error);
      setError(t("application:vas.noAvailableSharePurchaseMethod"));
      return;
    }

    setEmail("");
    setProviderId(payment.providers[0].id);
    setStep(PaymentWizardStep.form);
  }, [payment, providers]);

  useEffect(() => {
    return () => {
      if (checkLoop.current) {
        clearInterval(checkLoop.current);
      }
    };
  }, []);

  const checkPayment = () => {
    if (!createPaymentRes.current?.payment) {
      return;
    }
    setCheckLoading(true);
    dispatch(getPaymentStatus(createPaymentRes.current?.payment.id, createPaymentRes.current?.payment.trade_no))
      .then((res) => {
        switch (res.status) {
          case PaymentStatus.fulfilled:
            setStep(PaymentWizardStep.success);
            setTimeout(() => {
              onPaymentCompleted && onPaymentCompleted(res);
            }, 2000);
            break;
          case PaymentStatus.canceled:
          case PaymentStatus.fulfill_failed:
            setStep(PaymentWizardStep.error);
            setError(t("application:vas.fulfillFailed"));
            break;
          default:
        }
      })
      .finally(() => {
        setCheckLoading(false);
      });
  };

  return (
    <Box>
      {step === PaymentWizardStep.success && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 7,
            pb: 9,
          }}
        >
          <CheckmarkCircle fontSize={"large"} color={"success"} />
          <Typography
            variant={"h6"}
            sx={{
              color: (theme) => theme.palette.success.main,
              mt: 1,
            }}
          >
            {t("application:vas.paymentSuccess")}
          </Typography>
        </Box>
      )}
      {step === PaymentWizardStep.payment && (
        <Stack spacing={2}>
          {createPaymentRes.current?.request.url && !createPaymentRes.current?.request.qr_code_preferred && (
            <Typography variant={"body2"}>
              <Trans
                i18nKey={"application:vas.payInNewWindow"}
                components={[
                  <Link
                    target={"_blank"}
                    underline="hover"
                    variant={"inherit"}
                    href={createPaymentRes.current?.request.url}
                  />,
                ]}
              />
            </Typography>
          )}
          {createPaymentRes.current?.request?.qr_code_preferred && (
            <Box>
              <Typography variant={"body2"}>
                <Trans
                  i18nKey={"vas.qrcodeCustom"}
                  ns="application"
                  components={[<Link target={"_blank"} href={createPaymentRes.current?.request?.url ?? ""} />]}
                />
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <QRCodeSVG value={createPaymentRes.current?.request?.url ?? ""} />
              </Box>
            </Box>
          )}
          <LoadingButton onClick={checkPayment} variant={"contained"} loading={checkLoading}>
            <span>{t("application:vas.paidButton")}</span>
          </LoadingButton>
        </Stack>
      )}
      {step === PaymentWizardStep.error && (
        <Alert severity={"error"}>
          <AlertTitle> {t("application:vas.paymentFailedTitle")}</AlertTitle>
          {error}
        </Alert>
      )}
      {(step === PaymentWizardStep.loading || vasLoading != ConfigLoadState.Loaded) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 7,
            pb: 9,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {step === PaymentWizardStep.form && (
        <Stack spacing={3} sx={{ pt: 1 }}>
          {(providers.length ?? 0) > 1 && (
            <FormControl variant="outlined" fullWidth>
              <InputLabel>{t("application:vas.paymentMethod")}</InputLabel>
              <Select
                variant="outlined"
                startAdornment={
                  !isMobile && (
                    <InputAdornment position="start">
                      <WalletCreditCard />
                    </InputAdornment>
                  )
                }
                label={t("application:vas.paymentMethod")}
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
              >
                {providers &&
                  providers.map((p) => (
                    <MenuItem dense key={p.id} value={p.id}>
                      {p.points ? (
                        <Trans
                          i18nKey={"application:vas.payXPoints"}
                          components={[<PriceChip size={18} price={quantity * p.points} />]}
                        />
                      ) : (
                        p.name
                      )}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
          {!user && (
            <OutlineIconTextField
              icon={<MailOutlined />}
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label={t("application:login.email")}
              fullWidth
              helperText={t("application:vas.paymentEmailHelper")}
            />
          )}
          <Button onClick={() => createPayment()} variant={"contained"} disabled={(!user && !email) || !providerId}>
            {t("application:login.continue")}
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default PaymentWizard;
