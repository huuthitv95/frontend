// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import * as React from "react";
import { useState } from "react";
import { Box, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import StorageOption from "./StorageOption.tsx";
import { ProductType, StorageProduct } from "../../../api/vas.ts";
import PurchaseProductDialog from "../../VAS/PurchaseProductDialog.tsx";

const StorageProducts = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const storageProducts = useAppSelector((state) => state.siteConfig.vas.config?.storage_products);
  const [selected, setSelected] = useState<StorageProduct | undefined>();
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  return (
    <Box sx={{ mt: 2 }}>
      {storageProducts && (
        <PurchaseProductDialog
          type={ProductType.storage}
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
        {storageProducts &&
          storageProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <StorageOption
                product={product}
                selected={selected?.id === product.id}
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

export default StorageProducts;
