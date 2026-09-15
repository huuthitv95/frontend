// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, Tab, Tabs } from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FilePermission, FileResponse } from "../../../api/explorer.ts";
import Boolset from "../../../util/boolset.ts";
import useActionDisplayOpt from "../ContextMenu/useActionDisplayOpt.ts";
import Activities from "./Activities.tsx";
import Details from "./Details.tsx";
import Header from "./Header.tsx";

export interface SidebarContentProps {
  target: FileResponse | undefined | null;
  inPhotoViewer?: boolean;
  setTarget: (target: FileResponse | undefined | null) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ px: 2, py: 1 }}>{children}</Box>}
    </div>
  );
}

const SidebarContent = ({ target, inPhotoViewer, setTarget }: SidebarContentProps) => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  const targetUpdateable = useMemo(() => {
    if (!target?.permission) {
      return true;
    }
    const permission = new Boolset(target?.permission);
    return permission.enabled(FilePermission.update);
  }, [target?.permission]);

  const targetDisplayOptions = useActionDisplayOpt(target ? [target] : []);
  const tabIndexVal = targetUpdateable ? tabIndex : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Header target={target} />
      {target != null && (
        <>
          <Box
            sx={{
              width: "100%",
              bgcolor: "background.paper",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            {targetUpdateable && (
              <Tabs value={tabIndexVal} onChange={handleTabChange} variant={"fullWidth"} centered>
                <Tab label={t("fileManager.details")} />
                <Tab label={t("fileManager.activity")} />
              </Tabs>
            )}
          </Box>
          <Box sx={{ overflow: "auto" }}>
            <TabPanel value={tabIndexVal} index={0}>
              <Details
                inPhotoViewer={inPhotoViewer}
                target={target}
                setTarget={setTarget}
                targetDisplayOptions={targetDisplayOptions}
              />
            </TabPanel>
            <TabPanel value={tabIndexVal} index={1}>
              <Activities target={target} key={target.path} />
            </TabPanel>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SidebarContent;
