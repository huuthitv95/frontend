// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import {
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  PopoverProps,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { PermissionListItem } from "./PermissionList.tsx";

export interface PermissionSettingPopoverProps extends PopoverProps {
  item: PermissionListItem;
  onPermChange?: (item: PermissionListItem, key: PermissionKey, value: boolean) => void;
  readOnly?: boolean;
}

export type PermissionKey = "read" | "create" | "update" | "delete" | "share";

const permissionProps: {
  key: PermissionKey;
  label: string;
  description: string;
}[] = [
  {
    key: "read",
    label: "application:modals.read",
    description: "application:modals.readDes",
  },
  {
    key: "create",
    label: "application:modals.create",
    description: "application:modals.createDes",
  },
  {
    key: "update",
    label: "application:modals.update",
    description: "application:modals.updateDes",
  },
  {
    key: "delete",
    label: "application:modals.delete",
    description: "application:modals.deleteDes",
  },
  {
    key: "share",
    label: "application:modals.shareManagement",
    description: "application:modals.shareManagementDes",
  },
];

const PermissionSettingPopover = ({ item, onPermChange, readOnly, ...rest }: PermissionSettingPopoverProps) => {
  const { t } = useTranslation();
  const handleToggle = (key: PermissionKey) => () => {
    if (onPermChange) {
      onPermChange(item, key, !item.permission[key]);
    }
  };

  return (
    <Popover
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      {...rest}
    >
      <List dense sx={{ maxWidth: 360 }} disablePadding>
        {permissionProps.map((permission, index) => (
          <>
            <ListItem disablePadding key={permission.key}>
              <ListItemButton
                disabled={
                  readOnly ||
                  (item.disableSetHigherPerm && permission.key !== "read") ||
                  (item.disableShare && permission.key === "share")
                }
                onClick={handleToggle(permission.key)}
                sx={{ borderRadius: "0px" }}
                role={undefined}
                dense
              >
                <ListItemIcon sx={{ minWidth: "32px", margin: "0px 8px" }}>
                  <Checkbox
                    checked={item.permission[permission.key]}
                    size="small"
                    edge="start"
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  // sx={{ mt: "10px" }}
                  primary={t(permission.label)}
                  secondary={t(permission.description)}
                  slotProps={{
                    primary: {
                      variant: "body2",
                    },
                    secondary: {
                      variant: "caption",
                      sx: {
                        wordWrap: "break-word",
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
            {index < permissionProps.length - 1 && <Divider />}
          </>
        ))}
        <Divider />
      </List>
    </Popover>
  );
};

export default PermissionSettingPopover;
