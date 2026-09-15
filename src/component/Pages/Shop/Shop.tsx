// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import PageHeader, { PageTabQuery } from "../PageHeader.tsx";
import { Container } from "@mui/material";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import ResponsiveTabs, { Tab } from "../../Common/ResponsiveTabs.tsx";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { loadSiteConfig } from "../../../redux/thunks/site.ts";
import TicketDiagonal from "../../Icons/TicketDiagonal.tsx";
import StorageOutlined from "../../Icons/StorageOutlined.tsx";
import StorageProducts from "./StorageProducts.tsx";
import PersonStar from "../../Icons/PersonStar.tsx";
import GroupSkus from "./GroupSkus.tsx";
import Redeem from "./Redeem.tsx";
import PageContainer from "../PageContainer.tsx";

export enum DevicePageTab {
  Group = "group",
  Storage = "storage",
  Redeem = "redeem",
}

const Shop = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const storageProducts = useAppSelector((state) => state.siteConfig.vas.config?.storage_products);
  const groupSkus = useAppSelector((state) => state.siteConfig.vas.config?.group_skus);

  const tabs: Tab<DevicePageTab>[] = useMemo(() => {
    const res = [];
    if (groupSkus && groupSkus.length > 0) {
      res.push({
        label: t("application:vas.membership"),
        value: DevicePageTab.Group,
        icon: <PersonStar />,
      });
    }
    if (storageProducts && storageProducts.length > 0) {
      res.push({
        label: t("application:vas.storageExpansion"),
        value: DevicePageTab.Storage,
        icon: <StorageOutlined />,
      });
    }
    res.push({
      label: t("application:vas.redeem"),
      value: DevicePageTab.Redeem,
      icon: <TicketDiagonal />,
    });
    return res;
  }, [storageProducts]);

  const [tab, setTab] = useState(searchParams.get(PageTabQuery) ?? tabs[0].value);

  useEffect(() => {
    if (!searchParams.get(PageTabQuery)) {
      setTab(tabs[0].value);
    }
  }, [searchParams, tabs]);

  useEffect(() => {
    dispatch(loadSiteConfig("vas"));
  }, []);

  return (
    <PageContainer>
      <Container maxWidth="lg">
        <PageHeader title={t("application:vas.shop")} />
        <ResponsiveTabs value={tab} onChange={(_e, newValue) => setTab(newValue)} tabs={tabs} />
        {tab == DevicePageTab.Storage && storageProducts && <StorageProducts />}
        {tab == DevicePageTab.Group && groupSkus && <GroupSkus />}
        {tab == DevicePageTab.Redeem && <Redeem />}
      </Container>
    </PageContainer>
  );
};

export default Shop;
