import { ImageResponse } from "next/og";
import { ArvoAppIcon } from "@/lib/pwaIcon";

export const dynamic = "force-static";

// Ícone "maskable": o Android recorta o próprio formato (círculo, squircle...)
// por cima da imagem, então o símbolo precisa caber dentro da "safe zone"
// central (~80% do canvas) pra nunca ser cortado.
export async function GET() {
  const response = new ImageResponse(
    <ArvoAppIcon size={512} padding={128} />,
    { width: 512, height: 512 }
  );
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
}
