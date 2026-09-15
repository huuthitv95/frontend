// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
import { Icon } from "@iconify/react/dist/iconify.js";
import { Box, SvgIconProps } from "@mui/material";

export interface CustomIconProps extends SvgIconProps {
  icon: string;
}

const CustomIcon = ({ icon, sx, color, fontSize }: CustomIconProps) => {
  // Check if icon is a URL
  const isUrl = icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("data:");

  if (isUrl) {
    // Use Box as an image for URLs
    return (
      <Box
        component="img"
        src={icon}
        sx={{
          width: sx?.width || "20px",
          height: sx?.height || "20px",
          ...sx,
        }}
      />
    );
  }

  // Use Iconify for icon names, forwarding sx, color, and fontSize (size)
  const iconifyStyle: React.CSSProperties = {};

  if (color) {
    iconifyStyle.color = color;
  }

  if (fontSize) {
    iconifyStyle.fontSize = fontSize;
  }

  // Merge sx styles if provided
  if (sx) {
    Object.assign(iconifyStyle, sx);
  }

  return <Icon icon={icon} color={color} style={iconifyStyle} />;
};

export default CustomIcon;
