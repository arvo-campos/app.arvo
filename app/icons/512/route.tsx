import { ImageResponse } from "next/og";
import { ArvoAppIcon } from "@/lib/pwaIcon";

export const dynamic = "force-static";

export async function GET() {
  const response = new ImageResponse(
    <ArvoAppIcon size={512} padding={74} />,
    { width: 512, height: 512 }
  );
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}
