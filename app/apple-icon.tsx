import { ImageResponse } from "next/og";
import { ArvoAppIcon } from "@/lib/pwaIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<ArvoAppIcon size={180} padding={26} />, size);
}
