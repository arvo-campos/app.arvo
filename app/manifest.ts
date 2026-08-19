import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arvo — Caderno de Campo Digital",
    short_name: "Arvo",
    description:
      "Gestão digital de manejos em campos demonstrativos agrícolas.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF6EF",
    theme_color: "#C4501C",
    lang: "pt-BR",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/maskable-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
