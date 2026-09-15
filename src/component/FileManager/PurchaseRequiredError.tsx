// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Trans, useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../redux/hooks.ts";
import React, { useContext, useEffect, useState } from "react";
import { FmIndexContext } from "./FmIndexContext.tsx";
import { Box, Button, styled, Typography } from "@mui/material";
import Cart from "../Icons/Cart.tsx";
import { queueLoadShareInfo } from "../../redux/thunks/share.ts";
import CrUri from "../../util/uri.ts";
import { setPurchaseShareDialog } from "../../redux/globalStateSlice.ts";
import { Share } from "../../api/explorer.ts";
import Sparkle from "../Icons/Sparkle.tsx";

const PriceChipContainer = styled("span")(({ theme }) => ({
  boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
  color: theme.palette.primary.main,
  padding: "0 6px",
  alignItems: "center",
  display: "inline-flex",
  borderRadius: `8px`,
  gap: 4,
  verticalAlign: "middle",
  margin: "0 4px",
}));

export const PriceChip = ({ price, size }: { price: number; size?: number }) => {
  const { t } = useTranslation();
  return (
    <PriceChipContainer>
      <Sparkle sx={{ height: size ?? 22, width: size ?? 22, py: "1px" }} />
      {t("share.points", { num: price.toLocaleString() })}
    </PriceChipContainer>
  );
};

const PurchasedRequiredError = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const fmIndex = useContext(FmIndexContext);
  const path = useAppSelector((state) => state.fileManager[fmIndex].path);
  const [shareInfo, setShareInfo] = useState<Share | undefined>(undefined);

  useEffect(() => {
    if (path) {
      dispatch(queueLoadShareInfo(new CrUri(path))).then((res) => {
        setShareInfo(res);
      });
    }
  }, [path]);

  return (
    <Box sx={{ textAlign: "center" }}>
      <Cart sx={{ fontSize: 110, color: (theme) => theme.palette.action.disabled }} />
      <Box>
        <Typography color={"text.secondary"} sx={{ mt: 1 }}>
          <Trans
            i18nKey={"application:vas.sharePurchaseTitle"}
            components={[<PriceChip price={shareInfo?.price ?? 0} />]}
          />
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant={"contained"}
            onClick={() =>
              shareInfo &&
              dispatch(
                setPurchaseShareDialog({
                  target: shareInfo,
                  fmIndex,
                  open: true,
                }),
              )
            }
          >
            {t("vas.purchaseNow")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PurchasedRequiredError;
