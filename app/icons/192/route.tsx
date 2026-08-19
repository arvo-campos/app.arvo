import { ImageResponse } from "next/og";
import { ArvoAppIcon } from "@/lib/pwaIcon";

export const dynamic = "force-static";

export async function GET() {
  const response = new ImageResponse(
    <ArvoAppIcon size={192} padding={28} />,
    { width: 192, height: 192 }
  );
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}
