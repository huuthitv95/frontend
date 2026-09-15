// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { useAppDispatch } from "../../../redux/hooks.ts";
import { FormControl, InputAdornment, InputLabel, MenuItem, Select, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import Server from "../../Icons/Server.tsx";
import CircularProgress from "../CircularProgress.tsx";
import { NodeSummary } from "../../../api/workflow.ts";
import { getAvailableNodes } from "../../../api/api.ts";
import Boolset from "../../../util/boolset.ts";

export const AutoDispatch = " ";

export interface NodeSelectorProps {
  capacity: number;
  node: string;
  onChange: (node: string) => void;
}

const nodesCache: NodeSummary[] = [];

export const NodeSelector = ({ capacity, onChange, node }: NodeSelectorProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [nodes, setNodes] = useState<undefined | NodeSummary[]>(undefined);

  const filterNodes = useCallback(
    (nodes: NodeSummary[]) => {
      setNodes(
        nodes.filter((node) => {
          const capabilities = new Boolset(node.capabilities);
          return capabilities.enabled(capacity);
        }),
      );
    },
    [capacity],
  );

  useEffect(() => {
    if (capacity > 0) {
      if (nodesCache.length > 0) {
        filterNodes(nodesCache);
        return;
      }
      dispatch(getAvailableNodes())
        .then((nodes) => {
          filterNodes(nodes);
        })
        .catch(() => {
          setNodes([]);
        });
    }
  }, []);

  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="demo-simple-select-label">{t("modals.processNode")}</InputLabel>
      <Select
        variant="outlined"
        startAdornment={
          !isMobile && (
            <InputAdornment position="start">
              {nodes == undefined ? <CircularProgress sx={{ pt: "6px" }} size={24} /> : <Server />}
            </InputAdornment>
          )
        }
        label={t("modals.processNode")}
        value={node}
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value={AutoDispatch}>
          <em>{t("modals.remoteDownloadNodeAuto")}</em>
        </MenuItem>
        {nodes &&
          nodes.map((node) => (
            <MenuItem key={node.id} value={node.id}>
              {node.name}
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};
