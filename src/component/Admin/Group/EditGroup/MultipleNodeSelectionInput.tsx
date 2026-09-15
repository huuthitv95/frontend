// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, ListItemText, SelectChangeEvent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getNodeList } from "../../../../api/api";
import { Node } from "../../../../api/dashboard";
import { useAppDispatch } from "../../../../redux/hooks";
import FacebookCircularProgress from "../../../Common/CircularProgress";
import { DenseSelect, SquareChip } from "../../../Common/StyledComponents";
import { SquareMenuItem } from "../../../FileManager/ContextMenu/ContextMenu";

export interface MultipleNodeSelectionInputProps {
  value: number[];
  onChange: (value: number[]) => void;
}

const MultipleNodeSelectionInput = ({ value, onChange }: MultipleNodeSelectionInputProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodeMap, setNodeMap] = useState<Record<number, Node>>({});

  useEffect(() => {
    setLoading(true);
    dispatch(
      getNodeList({
        page_size: 1000,
        page: 1,
        order_by: "id",
        order_direction: "desc",
        conditions: {},
      }),
    )
      .then((res) => {
        setNodes(res.nodes);
        setNodeMap(
          res.nodes.reduce(
            (acc, node) => {
              acc[node.id] = node;
              return acc;
            },
            {} as Record<number, Node>,
          ),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;
    onChange(value as number[]);
  };

  return (
    <DenseSelect
      multiple
      displayEmpty
      disabled={loading}
      value={value}
      onChange={handleChange}
      sx={{
        minHeight: 39,
      }}
      MenuProps={{
        PaperProps: { sx: { maxWidth: 230 } },
        MenuListProps: {
          sx: {
            "& .MuiMenuItem-root": {
              whiteSpace: "normal",
            },
          },
        },
      }}
      renderValue={(selected) => {
        if (loading) {
          return <FacebookCircularProgress size={20} sx={{ mt: "1px" }} />;
        }
        if ((selected as number[]).length === 0) {
          return (
            <ListItemText
              primary={<em>{t("group.allNodes")}</em>}
              slotProps={{
                primary: { color: "textSecondary", variant: "body2" },
              }}
            />
          );
        }
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {(selected as number[]).map((value) =>
              nodeMap[value] ? (
                <SquareChip size="small" key={value} label={nodeMap[value]?.name} />
              ) : (
                <SquareChip size="small" key={value} label={t("group.deletedNode", { id: value })} />
              ),
            )}
          </Box>
        );
      }}
    >
      {nodes.map((g) => (
        <SquareMenuItem value={g.id}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant={"body2"} fontWeight={600}>
              {g.name}
            </Typography>
            <Typography variant={"caption"} color={"textSecondary"}>
              {g.server}
            </Typography>
          </Box>
        </SquareMenuItem>
      ))}
      {value
        .filter((id) => !nodes.find((n) => n.id === id))
        .map((id) => (
          <SquareMenuItem value={id}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant={"body2"} fontWeight={600} color="textSecondary">
                {t("group.deletedNode", { id })}
              </Typography>
            </Box>
          </SquareMenuItem>
        ))}
    </DenseSelect>
  );
};

export default MultipleNodeSelectionInput;
