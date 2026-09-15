// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import {
  Box,
  Stack,
  styled,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Capacity, StoragePack, UserSettings } from "../../../api/user.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { updateUserCapacity } from "../../../redux/thunks/filemanager.ts";
import { loadSiteConfig } from "../../../redux/thunks/site.ts";
import { sizeToString } from "../../../util";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../Common/StyledComponents.tsx";
import TimeBadge from "../../Common/TimeBadge.tsx";
import StorageOutlined from "../../Icons/StorageOutlined.tsx";
import SettingForm from "./SettingForm.tsx";

export const StorageBar = styled(Box)(({ theme }) => ({
  height: "10px",
  borderRadius: `${theme.shape.borderRadius}px`,
  width: "100%",
  backgroundColor: theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  overflow: "hidden",
}));

export const StoragePart = styled(Box)(() => ({
  transition: "width .6s ease",
  height: "100%",
  fontSize: "12px",
  lineHeight: "20px",
  float: "left",
}));

export const StorageBlock = styled(Box)(() => ({
  display: "inline-block",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  marginRight: "5px",
}));

export interface StorageSettingProps {
  setting: UserSettings;
}

const StoragePackColumn = ({ storagePack }: { storagePack: StoragePack }) => {
  return (
    <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <NoWrapTableCell>{storagePack.name}</NoWrapTableCell>
      <NoWrapTableCell>{sizeToString(storagePack.size)}</NoWrapTableCell>
      <NoWrapTableCell>
        <TimeBadge variant={"inherit"} datetime={storagePack.active_since} />
      </NoWrapTableCell>
      <NoWrapTableCell>
        <TimeBadge variant={"inherit"} datetime={storagePack.expire_at} />
      </NoWrapTableCell>
    </TableRow>
  );
};

export const CapacityBar = ({ capacity, forceRow }: { capacity?: Capacity; forceRow?: boolean }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")) || forceRow;
  const { t } = useTranslation();
  const [storageBreakdown, setStorageBreakdown] = useState({
    used: 0,
    base: 0,
    pack: 0,
  });
  useEffect(() => {
    let summary = {
      used: 0,
      base: 0,
      pack: 0,
    };

    if (!capacity) {
      return;
    }

    const base = capacity.total - capacity.storage_pack_total;
    summary.used = capacity.used;
    if (capacity.used > base) {
      summary.base = 0;
      summary.pack = capacity.total - capacity.used > 0 ? capacity.total - capacity.used : 0;
    } else {
      summary.base = base - capacity.used;
      summary.pack = capacity.storage_pack_total;
    }

    summary.used = (summary.used > capacity.total ? capacity.total : summary.used) / capacity.total;
    summary.base = summary.base / capacity.total;
    summary.pack = summary.pack / capacity.total;
    setStorageBreakdown(summary);
  }, [capacity]);

  return (
    <>
      <StorageBar>
        <StoragePart
          sx={{
            backgroundColor: (theme) => theme.palette.warning.light,
            width: `${storageBreakdown.used * 100}%`,
          }}
        />
        <StoragePart
          sx={{
            backgroundColor: (theme) => theme.palette.success.light,
            width: `${storageBreakdown.base * 100}%`,
          }}
        />
        <StoragePart
          sx={{
            backgroundColor: (theme) => theme.palette.info.light,
            width: `${storageBreakdown.pack * 100}%`,
          }}
        />
      </StorageBar>
      <Stack spacing={isMobile ? 1 : 2} direction={isMobile ? "column" : "row"} sx={{ mt: 1 }}>
        <Typography variant={"caption"}>
          <StorageBlock
            sx={{
              backgroundColor: (theme) => theme.palette.warning.light,
            }}
          />
          {t("vas.used", {
            size: sizeToString(capacity?.used ?? 0),
          })}
        </Typography>
        <Typography variant={"caption"}>
          <StorageBlock
            sx={{
              backgroundColor: (theme) => theme.palette.success.light,
            }}
          />
          {t("vas.groupBaseQuota", {
            size: sizeToString((capacity?.total ?? 0) - (capacity?.storage_pack_total ?? 0)),
          })}
        </Typography>
        <Typography variant={"caption"}>
          <StorageBlock
            sx={{
              backgroundColor: (theme) => theme.palette.info.light,
            }}
          />
          {t("vas.validPackQuota", {
            size: sizeToString(capacity?.storage_pack_total ?? 0),
          })}
        </Typography>
        <Typography variant={"caption"}>
          <StorageBlock
            sx={{
              backgroundColor: (theme) => theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
            }}
          />
          {t("vas.total", {
            size: sizeToString(capacity?.total ?? 0),
          })}
        </Typography>
      </Stack>
    </>
  );
};

const StorageSetting = ({ setting }: StorageSettingProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const capacity = useAppSelector((state) => state.fileManager[0].capacity);
  const storageProducts = useAppSelector((state) => state.siteConfig.vas.config?.storage_products);

  const [storageBreakdown, setStorageBreakdown] = useState({
    used: 0,
    base: 0,
    pack: 0,
  });

  useEffect(() => {
    dispatch(updateUserCapacity(0));
    dispatch(loadSiteConfig("vas"));
  }, []);

  return (
    <Stack spacing={3}>
      <SettingForm title={t("vas.quota")}>
        <Box sx={{ mt: 1 }}>
          <CapacityBar capacity={capacity} />
          {storageProducts && storageProducts.length > 0 && (
            <SecondaryButton
              sx={{ mt: 1 }}
              onClick={() => navigate("/shop?tab=storage")}
              variant={"contained"}
              startIcon={<StorageOutlined />}
            >
              {t("vas.buyStorage")}
            </SecondaryButton>
          )}
        </Box>
      </SettingForm>
      <SettingForm title={t("vas.validStorage")}>
        <TableContainer sx={{ mt: 1 }} component={StyledTableContainerPaper}>
          <Table sx={{ width: "100%" }} size="small">
            <TableHead>
              <TableRow>
                <NoWrapTableCell>{t("fileManager.name")}</NoWrapTableCell>
                <NoWrapTableCell>{t("fileManager.size")}</NoWrapTableCell>
                <NoWrapTableCell>{t("vas.activationDate")}</NoWrapTableCell>
                <NoWrapTableCell>{t("vas.expiredAt")}</NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {setting.storage_packs?.map((s, index) => <StoragePackColumn storagePack={s} key={index} />)}
            </TableBody>
          </Table>
          {!setting.storage_packs && (
            <Box sx={{ p: 1, width: "100%", textAlign: "center" }}>
              <Typography variant={"caption"} color={"text.secondary"}>
                {t("application:setting.listEmpty")}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </SettingForm>
    </Stack>
  );
};

export default StorageSetting;
