// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { ProductType } from "../../api/vas.ts";
import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import {
  Box,
  Button,
  DialogContent,
  FilledInput,
  FormControl,
  InputAdornment,
  InputLabel,
  Stack,
  Typography,
} from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { ConfigLoadState } from "../../redux/siteConfigSlice.ts";
import { loadSiteConfig, updateSiteConfig } from "../../redux/thunks/site.ts";
import DraggableDialog from "../Dialogs/DraggableDialog.tsx";
import AutoHeight from "../Common/AutoHeight.tsx";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { parseInt } from "lodash";
import { formatPrice } from "../../util";
import PaymentWizard from "./PaymentWizard.tsx";
import { updateUserCapacity } from "../../redux/thunks/filemanager.ts";
import { FileManagerIndex } from "../FileManager/FileManager.tsx";
import { PriceChip } from "../FileManager/PurchaseRequiredError.tsx";

export interface PurchaseProductDialogProps {
  type: ProductType;
  priceCashUnit: number;
  pricePoints?: number;
  duration?: number;
  productId?: string;
  name: string;
  open: boolean;
  onClose?: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
}

enum PurchaseStep {
  form,
  payment,
}

const PurchaseProductDialog = (props: PurchaseProductDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { type, priceCashUnit, pricePoints, duration, productId } = props;
  const { payment, point_enabled } = useAppSelector((state) => state.siteConfig.vas.config);
  const vasLoading = useAppSelector((state) => state.siteConfig.vas.loaded);

  const [step, setStep] = useState<PurchaseStep>(PurchaseStep.form);
  const [count, setCount] = useState(1);

  const onClose = useCallback(() => {
    props.onClose && props.onClose({}, "backdropClick");
    setTimeout(() => {
      setStep(PurchaseStep.form);
      setCount(1);
    }, 200);
  }, [props.onClose]);

  useEffect(() => {
    if (props.open) {
      if (vasLoading != ConfigLoadState.Loaded) {
        dispatch(loadSiteConfig("vas"));
      }
    }
  }, [props.open]);

  const onCompleted = useCallback(() => {
    dispatch(updateUserCapacity(FileManagerIndex.main));
    dispatch(updateSiteConfig());
  }, [dispatch]);

  return (
    <DraggableDialog
      title={t("application:vas.purchaseSomething", {
        name: props.name,
      })}
      hideOk
      dialogProps={{
        open: props.open ?? false,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "xs",
      }}
    >
      <DialogContent>
        <AutoHeight>
          <SwitchTransition>
            <CSSTransition
              addEndListener={(node, done) => node.addEventListener("transitionend", done, false)}
              classNames="fade"
              key={step}
            >
              <Box>
                {step == PurchaseStep.form && (
                  <Stack spacing={2} sx={{ pt: 1 }}>
                    {duration && (
                      <FormControl sx={{ mt: 2 }} variant={"filled"}>
                        <InputLabel htmlFor="component-helper">{t("vas.purchaseDuration")}</InputLabel>
                        <FilledInput
                          value={count}
                          type={"number"}
                          inputProps={{
                            step: 1,
                            min: 1,
                            max: Math.pow(2, 31) - 1,
                          }}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCount(parseInt(e.target.value) ?? 0)}
                          endAdornment={
                            <InputAdornment position="end">
                              <Typography sx={{ pt: "10px" }}>
                                {"x "}
                                {t("vas.validDurationDays", {
                                  num: Math.ceil((duration ?? 0) / 86400),
                                })}
                              </Typography>
                            </InputAdornment>
                          }
                        />
                      </FormControl>
                    )}
                    {type == ProductType.points && (
                      <FormControl sx={{ mt: 2 }} variant={"filled"}>
                        <InputLabel htmlFor="component-helper">{t("vas.creditsNum")}</InputLabel>
                        <FilledInput
                          value={count}
                          type={"number"}
                          inputProps={{
                            step: 1,
                            min: 1,
                            max: Math.pow(2, 31) - 1,
                          }}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCount(parseInt(e.target.value) ?? 0)}
                        />
                      </FormControl>
                    )}
                    {!!(props.pricePoints && point_enabled) && (
                      <Typography variant={"caption"} color={"text.secondary"}>
                        <Trans
                          i18nKey="application:vas.pointsPayAvailable"
                          components={[
                            <PriceChip size={16} price={props.pricePoints * (Number.isNaN(count) ? 1 : count)} />,
                          ]}
                        />
                      </Typography>
                    )}
                    {payment && (
                      <Button
                        variant={"contained"}
                        disabled={!count || count <= 0}
                        onClick={() => setStep(PurchaseStep.payment)}
                      >
                        {t("application:vas.payAmount", {
                          price: formatPrice(
                            payment.currency_mark,
                            priceCashUnit * (Number.isNaN(count) ? 1 : count),
                            payment.currency_unit,
                          ),
                        })}
                      </Button>
                    )}
                  </Stack>
                )}
                {step == PurchaseStep.payment && (
                  <PaymentWizard
                    onPaymentCompleted={() => onCompleted()}
                    pointPrice={props.pricePoints}
                    product={{
                      type: props.type,
                      sku_id: props.productId,
                    }}
                    showPointsProvider={!!props.pricePoints}
                    quantity={count}
                  />
                )}
              </Box>
            </CSSTransition>
          </SwitchTransition>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};

export default PurchaseProductDialog;
