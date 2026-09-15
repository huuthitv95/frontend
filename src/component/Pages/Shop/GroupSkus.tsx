// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import * as React from "react";
import { useState } from "react";
import { Box, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { GroupSku, ProductType } from "../../../api/vas.ts";
import PurchaseProductDialog from "../../VAS/PurchaseProductDialog.tsx";
import GroupSkuOption from "./GroupSkuOption.tsx";

const GroupSkus = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const groupSkus = useAppSelector((state) => state.siteConfig.vas.config?.group_skus);
  const [selected, setSelected] = useState<GroupSku | undefined>();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  return (
    <Box sx={{ mt: 2 }}>
      {groupSkus && (
        <PurchaseProductDialog
          type={ProductType.group}
          name={selected?.name ?? ""}
          productId={selected?.id ?? ""}
          priceCashUnit={selected?.price ?? 0}
          pricePoints={selected?.points ?? 0}
          duration={selected?.time ?? 0}
          open={purchaseOpen}
          onClose={() => setPurchaseOpen(false)}
        />
      )}
      <Grid container spacing={2}>
        {groupSkus &&
          groupSkus.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <GroupSkuOption
                sku={product}
                onSelect={(product) => {
                  setSelected(product);
                  setPurchaseOpen(true);
                }}
              />
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

export default GroupSkus;
