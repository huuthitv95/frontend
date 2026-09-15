// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, IconButton, TableRow, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { debounce } from "@mui/material";
import { Share } from "../../../../api/dashboard";
import { getShareList } from "../../../../api/api";
import { useAppDispatch } from "../../../../redux/hooks";
import { DenseFilledTextField, NoWrapCell } from "../../../Common/StyledComponents";
import FileTypeIcon from "../../../FileManager/Explorer/FileTypeIcon";
import ArrowDown from "../../../Icons/ArrowDown";
import Dismiss from "../../../Icons/Dismiss";
import LinkDismiss from "../../../Icons/LinkDismiss";

const DND_TYPE = "default-pinned-share-row";

type DragItem = { index: number };

export interface DraggablePinnedShareRowProps {
  shareId: number;
  share?: Share;
  name: string;
  index: number;
  moveRow: (from: number, to: number) => void;
  onNameChange: (name: string) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  t: any;
  style?: React.CSSProperties;
}

const DraggablePinnedShareRow = React.memo(
  React.forwardRef<HTMLTableRowElement, DraggablePinnedShareRowProps>(
    (
      { shareId, share, name, index, moveRow, onNameChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, t, style },
      ref,
    ): JSX.Element => {
      const theme = useTheme();
      const dispatch = useAppDispatch();
      const [resolvedShare, setResolvedShare] = useState<Share | undefined>(share);

      useEffect(() => {
        if (share) {
          setResolvedShare(share);
          return;
        }
        if (!shareId) return;
        let cancelled = false;
        dispatch(
          getShareList({
            page: 1,
            page_size: 1,
            order_by: "",
            order_direction: "desc",
            conditions: {
              share_id: shareId.toString(),
            },
          }),
        )
          .then((res) => {
            if (cancelled) return;
            const found = res?.shares?.find((s) => s.id === shareId);
            if (found) setResolvedShare(found);
          })
          .catch(() => {});
        return () => {
          cancelled = true;
        };
      }, [shareId, share, dispatch]);

      const [, drop] = useDrop<DragItem>({
        accept: DND_TYPE,
        hover(item, monitor) {
          if (!(ref && typeof ref !== "function" && ref.current)) return;
          const dragIndex = item.index;
          const hoverIndex = index;
          if (dragIndex === hoverIndex) return;
          const hoverBoundingRect = ref.current.getBoundingClientRect();
          const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
          const clientOffset = monitor.getClientOffset();
          if (!clientOffset) return;
          const hoverClientY = clientOffset.y - hoverBoundingRect.top;
          if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
          if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
          moveRow(dragIndex, hoverIndex);
          item.index = hoverIndex;
        },
      });
      const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
        type: DND_TYPE,
        item: { index },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      });

      const setRowRef = (node: HTMLTableRowElement | null) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTableRowElement | null>).current = node;
        }
        drag(drop(node));
      };

      const fileName = resolvedShare?.edges?.file?.name ?? t("application:share.expiredLink");
      const fileType = resolvedShare?.edges?.file?.type ?? 0;

      const debouncedNameChange = React.useMemo(
        () => debounce((value: string) => onNameChange(value), 200),
        [onNameChange],
      );

      return (
        <TableRow ref={setRowRef} hover style={{ opacity: isDragging ? 0.5 : 1, cursor: "move", ...style }}>
          <NoWrapCell>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {resolvedShare?.edges?.file ? (
                <FileTypeIcon name={fileName} fileType={fileType} />
              ) : (
                <LinkDismiss sx={{ color: theme.palette.action.active }} />
              )}
              {fileName}
            </Box>
          </NoWrapCell>
          <NoWrapCell>
            <DenseFilledTextField
              variant="outlined"
              size="small"
              defaultValue={name}
              onChange={(e) => debouncedNameChange(e.target.value)}
              placeholder={fileName}
              fullWidth
              onMouseDown={(e) => e.stopPropagation()}
              sx={{ minWidth: 160, mt: 0 }}
            />
          </NoWrapCell>
          <NoWrapCell>
            <IconButton size="small" onClick={onDelete}>
              <Dismiss fontSize="small" />
            </IconButton>
          </NoWrapCell>
          <NoWrapCell>
            <IconButton size="small" onClick={onMoveUp} disabled={isFirst}>
              <ArrowDown
                sx={{
                  width: "18px",
                  height: "18px",
                  transform: "rotate(180deg)",
                }}
              />
            </IconButton>
            <IconButton size="small" onClick={onMoveDown} disabled={isLast}>
              <ArrowDown
                sx={{
                  width: "18px",
                  height: "18px",
                }}
              />
            </IconButton>
          </NoWrapCell>
        </TableRow>
      );
    },
  ),
);

export default DraggablePinnedShareRow;
