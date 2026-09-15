// This file is part of Cloudreve Pro edition source code, Reference ID: 1146
// changeThemeColor changes the theme color of the browser
import i18next from "i18next";
import { enqueueSnackbar } from "notistack";
import { MutableRefObject, RefCallback } from "react";
import { useLocation } from "react-router-dom";
import { FileResponse, Metadata } from "../api/explorer.ts";
import { DefaultCloseAction } from "../component/Common/Snackbar/snackbar.tsx";

export const changeThemeColor = (color: string) => {
  const metaThemeColor = window.document.querySelector("meta[name=theme-color]");
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", color);
  }
};

export const useQuery = (): URLSearchParams => {
  return new URLSearchParams(useLocation().search);
};

// getFileLinkedUri returns the linked uri of the file.
export const getFileLinkedUri = (file: FileResponse) => {
  if (file.metadata && file.metadata[Metadata.share_redirect]) {
    return file.metadata[Metadata.share_redirect];
  }

  return file.path;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sizeToString = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

const decodeTimeFlowStringTime = (str: string, timeNow: number) => {
  timeNow = Math.floor(timeNow / 1000);
  const timeNowBackup = timeNow;
  const timeDigits: number[] = [];
  if (str.length === 0) {
    return "";
  }
  while (timeNow > 0) {
    timeDigits.push(timeNow % 10);
    timeNow = Math.floor(timeNow / 10);
  }
  const res = Array.from(str);
  let secret = Array.from(str);
  let add = false;
  if (secret.length % 2 === 0) {
    add = true;
  }
  let timeDigitIndex = (secret.length - 1) % timeDigits.length;
  const l = secret.length;
  for (let pos = 0; pos < l; pos++) {
    let newIndex = res.length - 1 - pos;
    if (add) {
      newIndex = newIndex + timeDigits[timeDigitIndex] * timeDigitIndex;
    } else {
      newIndex = 2 * timeDigitIndex * timeDigits[timeDigitIndex] - newIndex;
    }

    if (newIndex < 0) {
      newIndex = newIndex * -1;
    }

    newIndex = newIndex % secret.length;

    res[res.length - 1 - pos] = secret[newIndex];
    const a = secret[res.length - 1 - pos];
    const b = secret[newIndex];
    secret[newIndex] = a;
    secret[res.length - 1 - pos] = b;

    secret = secret.slice(0, secret.length - 1);

    add = !add;
    // Add timeDigitIndex by 1, but does not exceed total digits in timeNow
    timeDigitIndex--;
    if (timeDigitIndex < 0) {
      timeDigitIndex = timeDigits.length - 1;
    }
  }
  const resStr = res.join("");
  const resSep = resStr.split("|");
  if (resSep.length < 1 || resSep[0] != timeNowBackup.toString()) {
    throw new Error("Invalid time flow string");
  }

  return resStr.slice(resSep[0].length + 1);
};

export const decodeTimeFlowString = (str: string) => {
  // Unix second timestamp
  let timeNow = Math.floor(new Date().getTime() / 1000);
  try {
    return decodeTimeFlowStringTime(str, timeNow);
  } catch (e) {}
  try {
    return decodeTimeFlowStringTime(str, timeNow - 1000);
  } catch (e) {}
  try {
    return decodeTimeFlowStringTime(str, timeNow + 1000);
  } catch (e) {}

  return "";
};

export type MutableRefList<T> = Array<RefCallback<T> | MutableRefObject<T> | undefined | null>;

export function mergeRefs<T>(...refs: MutableRefList<T>): RefCallback<T> {
  return (val: T) => {
    setRef(val, ...refs);
  };
}

export function setRef<T>(val: T, ...refs: MutableRefList<T>): void {
  refs.forEach((ref) => {
    if (typeof ref === "function") {
      ref(val);
    } else if (ref != null) {
      ref.current = val;
    }
  });
}

export const copyToClipboard = (text: string) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
    enqueueSnackbar(i18next.t("setting.copied"), {
      action: DefaultCloseAction,
    });
  } else {
    enqueueSnackbar(i18next.t("setting.pleaseManuallyCopy"), {
      variant: "warning",
      action: DefaultCloseAction,
    });
  }
};

export const sendLink = (name: string, url: string) => {
  if (navigator.share) {
    navigator.share({
      title: name,
      url: url,
    });
  } else {
    enqueueSnackbar(i18next.t("setting.browserNotSupported"), {
      variant: "warning",
      action: DefaultCloseAction,
    });
  }
};

export const fileExtension = (name: string) => {
  return name.split(".").pop()?.toLowerCase();
};

export function fileNameNoExt(filename: string) {
  return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

export async function dataUrlToBytes(dataUrl: string) {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

export const fileBase = (path: string): string => {
  return path.split("/").pop() || "";
};

export const formatPrice = (mark: string, price: number, currency_unit: number) => {
  return `${mark}${(price / currency_unit).toFixed(Math.floor(Math.log10(currency_unit)))}`;
};

export function bufferDecode(v: string) {
  return Uint8Array.from(atob(v), (c) => c.charCodeAt(0));
}

export function urlBase64BufferDecode(v: string) {
  // Replace non-url compatible chars with base64 standard chars
  v = v.replace(/-/g, "+").replace(/_/g, "/");

  // Pad out with standard base64 required padding characters
  var pad = v.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error("InvalidLengthError: Input base64url string is the wrong length to determine padding");
    }
    v += new Array(5 - pad).join("=");
  }

  return bufferDecode(v);
}

export function bufferEncode(value: ArrayBuffer) {
  // @ts-ignore
  return btoa(String.fromCharCode.apply(null, new Uint8Array(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function uuidv4() {
  if (crypto && crypto.getRandomValues) {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
      (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16),
    );
  } else {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export function randomString(length: number) {
  // include uppercase, lowercase and numbers
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
