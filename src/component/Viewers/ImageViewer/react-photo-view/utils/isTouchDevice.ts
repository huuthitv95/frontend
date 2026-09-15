// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
/**
 * 是否支持触摸设备
 */
const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

export default isTouchDevice;
