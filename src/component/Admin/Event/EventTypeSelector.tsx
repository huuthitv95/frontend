// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Box, FormHelperText, ListItemText, ListSubheader, SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DenseSelect, SquareChip } from "../../Common/StyledComponents";
import { SquareMenuItem } from "../../FileManager/ContextMenu/ContextMenu";
import { eventCategories, getEventName } from "../Settings/Event/Events";

interface EventTypeSelectorProps {
  value: string[] | number[];
  onChange: (event: SelectChangeEvent<unknown>) => void;
  renderValue?: (selected: unknown) => React.ReactNode;
  helperText?: string;
  showAllOption?: boolean;
  allOptionText?: string;
  fullWidth?: boolean;
  displayEmpty?: boolean;
}

const EventTypeSelector = ({
  value,
  onChange,
  renderValue,
  helperText,
  showAllOption = false,
  allOptionText,
  fullWidth = true,
  displayEmpty = false,
}: EventTypeSelectorProps) => {
  const { t } = useTranslation("dashboard");

  const defaultRenderValue = (selected: unknown) => {
    const values = Array.isArray(selected) ? selected : [];
    return (
      <Box display="flex" flexWrap="wrap" gap={0.5}>
        {values.map((val) => {
          const eventType = typeof val === "string" ? parseInt(val) : val;
          return <SquareChip key={val} label={t(`settings.event.${getEventName(eventType)}`)} size="small" />;
        })}
      </Box>
    );
  };

  return (
    <>
      <DenseSelect
        fullWidth={fullWidth}
        multiple
        value={value}
        onChange={onChange}
        renderValue={renderValue || defaultRenderValue}
        displayEmpty={displayEmpty}
      >
        {showAllOption && (
          <SquareMenuItem value={[]} disabled>
            <ListItemText
              primary={allOptionText || t("event.allEventTypes")}
              slotProps={{ primary: { variant: "body2", style: { fontStyle: "italic" } } }}
            />
          </SquareMenuItem>
        )}
        {Object.values(eventCategories).map((cat) => [
          <ListSubheader key={cat.title} sx={{ fontWeight: 600, px: "12px", color: (t) => t.palette.primary.main }}>
            {t(cat.title)}
          </ListSubheader>,
          ...cat.events.map((event) => (
            <SquareMenuItem value={event} key={event}>
              <ListItemText
                primary={t(`settings.event.${getEventName(event)}`)}
                slotProps={{ primary: { variant: "body2" } }}
              />
            </SquareMenuItem>
          )),
        ])}
      </DenseSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </>
  );
};

export default EventTypeSelector;
