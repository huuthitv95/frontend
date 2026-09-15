// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Trans, useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  DialogContent,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks.ts";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DraggableDialog from "../../../Dialogs/DraggableDialog.tsx";
import AutoHeight from "../../../Common/AutoHeight.tsx";
import { closePurchaseShareDialog } from "../../../../redux/globalStateSlice.ts";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { PriceChip } from "../../PurchaseRequiredError.tsx";
import { ConfigLoadState } from "../../../../redux/siteConfigSlice.ts";
import { loadSiteConfig } from "../../../../redux/thunks/site.ts";
import SessionManager, { UserSettings } from "../../../../session";
import { SquareChip } from "../../../Common/StyledComponents.tsx";
import WalletCreditCard from "../../../Icons/WalletCreditCard.tsx";
import PaymentWizard from "../../../VAS/PaymentWizard.tsx";
import { Payment, ProductType } from "../../../../api/vas.ts";
import { refreshFileList } from "../../../../redux/thunks/filemanager.ts";
import { FileManagerIndex } from "../../FileManager.tsx";
import { router } from "../../../../router";
import HistoryOutlined from "../../../Icons/HistoryOutlined.tsx";
import { OutlineIconTextField } from "../../../Common/Form/OutlineIconTextField.tsx";
import Sparkle from "../../../Icons/Sparkle.tsx";
import { formatPrice } from "../../../../util";

enum PurchasePhase {
  intro,
  form,
  restore,
}

const PurchaseShare = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [phase, setPhase] = useState(PurchasePhase.intro);
  const [payWithPoints, setPayWithPoints] = useState(false);
  const [resumeTicket, setResumeTicket] = useState("");
  const open = useAppSelector((state) => state.globalState.purchaseShareDialogOpen);
  const target = useAppSelector((state) => state.globalState.purchaseShareDialogTarget);
  const fmIndex = useAppSelector((state) => state.globalState.purchaseShareDialogFmIndex);
  const { payment, anonymous_purchase, point_enabled, point_price } = useAppSelector(
    (state) => state.siteConfig.vas.config,
  );
  const vasLoading = useAppSelector((state) => state.siteConfig.vas.loaded);

  const onClose = useCallback(() => {
    dispatch(closePurchaseShareDialog());
    setTimeout(() => {
      setPhase(PurchasePhase.intro);
    }, 200);
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      if (vasLoading != ConfigLoadState.Loaded) {
        dispatch(loadSiteConfig("vas"));
      }
      setPhase(PurchasePhase.intro);
      setResumeTicket(SessionManager.getWithFallback(UserSettings.PurchaseTicket));
    }
  }, [open]);

  const user = useMemo(() => SessionManager.currentLoginOrNull(), []);

  const cashPrice = useMemo(() => {
    if (!target?.price || !payment || !point_price) {
      return "-";
    }

    return formatPrice(payment.currency_mark, target.price * point_price, payment.currency_unit);
  }, [target?.price, payment, point_price]);

  const refreshWithTicket = useCallback(
    (ticket?: string) => {
      onClose();
      if (ticket) {
        SessionManager.set(UserSettings.PurchaseTicket, ticket);
      }
      dispatch(refreshFileList(fmIndex ?? FileManagerIndex.main));
    },
    [onClose, fmIndex, dispatch],
  );

  const onPaymentCompleted = useCallback(
    (payment: Payment) => {
      refreshWithTicket(payment.ticket);
    },
    [refreshWithTicket],
  );

  const proceedPayWithCash = useCallback(() => {
    setPayWithPoints(false);
    setPhase(PurchasePhase.form);
  }, [user]);

  const proceedPayWithPoints = useCallback(() => {
    if (!user) {
      onClose();
      router.navigate("/session?redirect=" + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    setPayWithPoints(true);
    setPhase(PurchasePhase.form);
  }, []);

  return (
    <DraggableDialog
      title={t("application:vas.purchaseShareLink")}
      hideOk
      dialogProps={{
        open: open ?? false,
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
              key={phase}
            >
              <Box>
                {phase == PurchasePhase.restore && (
                  <Stack spacing={3} sx={{ pt: 1 }}>
                    <OutlineIconTextField
                      icon={<HistoryOutlined />}
                      variant="outlined"
                      value={resumeTicket}
                      onChange={(e) => setResumeTicket(e.target.value)}
                      label={t("application:vas.resumeTicket")}
                      fullWidth
                      helperText={t("application:vas.resumeTicketDes")}
                    />
                    <Button
                      onClick={() => refreshWithTicket(resumeTicket)}
                      variant={"contained"}
                      disabled={!resumeTicket}
                    >
                      {t("application:vas.restorePurchase")}
                    </Button>
                  </Stack>
                )}
                {phase == PurchasePhase.form && target && (
                  <PaymentWizard
                    pointsProviderOnly={payWithPoints}
                    onPaymentCompleted={onPaymentCompleted}
                    product={{
                      type: ProductType.share_link,
                      share_link_id: target?.id,
                    }}
                    quantity={1}
                  />
                )}
                {phase == PurchasePhase.intro && (
                  <Stack spacing={1}>
                    <Typography variant={"body2"}>
                      <Trans
                        i18nKey={"application:vas.sharePurchaseTitle"}
                        components={[<PriceChip price={target?.price ?? 0} />]}
                      />
                    </Typography>
                    {!point_enabled && !point_price && (
                      <Alert severity="warning">{t("application:vas.noAvailableSharePurchaseMethod")}</Alert>
                    )}
                    {(point_enabled || point_price) && (
                      <List
                        dense
                        sx={{
                          width: "100%",
                        }}
                      >
                        {point_enabled && (
                          <ListItem disablePadding>
                            <ListItemButton onClick={proceedPayWithPoints}>
                              <ListItemIcon sx={{ minWidth: "48px" }}>
                                <Sparkle sx={{ height: 32 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box>
                                    {t("vas.payWithPoints")}
                                    {!user && (
                                      <SquareChip
                                        sx={{ ml: 1 }}
                                        color={"primary"}
                                        size={"small"}
                                        label={t("vas.loginRequired")}
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  user && (
                                    <Box>
                                      {t("vas.pointsBalance", {
                                        num: (user.user.credit ?? 0).toLocaleString(),
                                      })}
                                      {point_price && (
                                        <Link
                                          onMouseDown={(e) => e.stopPropagation()}
                                          onClick={(e) => e.stopPropagation()}
                                          underline="hover"
                                          sx={{ ml: 1 }}
                                          variant={"inherit"}
                                          href={"/settings?tab=finance"}
                                        >
                                          {t("vas.recharge")}
                                        </Link>
                                      )}
                                    </Box>
                                  )
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        )}
                        {point_price && (
                          <ListItem disablePadding>
                            <ListItemButton onClick={proceedPayWithCash}>
                              <ListItemIcon sx={{ minWidth: "48px" }}>
                                <WalletCreditCard sx={{ height: 32 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box>
                                    {t("vas.payWithCash")}
                                    {!user && !anonymous_purchase && (
                                      <SquareChip
                                        sx={{ ml: 1 }}
                                        color={"primary"}
                                        size={"small"}
                                        label={t("vas.loginRequired")}
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  <Box>
                                    {t("vas.payEquivalentCash", {
                                      num: cashPrice,
                                    })}
                                  </Box>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        )}
                        {!user && (
                          <ListItem disablePadding>
                            <ListItemButton onClick={() => setPhase(PurchasePhase.restore)}>
                              <ListItemIcon sx={{ minWidth: "48px" }}>
                                <HistoryOutlined sx={{ height: 32 }} />
                              </ListItemIcon>
                              <ListItemText
                                primary={<Box>{t("vas.restorePurchase")}</Box>}
                                secondary={t("vas.restorePurchaseDes")}
                              />
                            </ListItemButton>
                          </ListItem>
                        )}
                      </List>
                    )}
                  </Stack>
                )}
              </Box>
            </CSSTransition>
          </SwitchTransition>
        </AutoHeight>
      </DialogContent>
    </DraggableDialog>
  );
};
export default PurchaseShare;
