import { Font } from "@react-pdf/renderer";
import path from "node:path";

const fontDir = path.resolve(
  process.cwd(),
  "node_modules/@fontsource/archivo/files"
);

let registered = false;

export function registerFonts() {
  if (registered) return;
  Font.register({
    family: "Archivo",
    fonts: [
      { src: path.join(fontDir, "archivo-latin-400-normal.woff2"), fontWeight: 400 },
      { src: path.join(fontDir, "archivo-latin-500-normal.woff2"), fontWeight: 500 },
      { src: path.join(fontDir, "archivo-latin-600-normal.woff2"), fontWeight: 600 },
      { src: path.join(fontDir, "archivo-latin-700-normal.woff2"), fontWeight: 700 },
    ],
  });
  registered = true;
}

export const PDF_COLORS = {
  terracota: "#C4501C",
  grafite: "#1C1B19",
  grafiteMuted: "#1C1B1999",
  grafiteFaint: "#1C1B1966",
  bg: "#FAF6EF",
  border: "#1C1B191A",
  white: "#FFFFFF",
};
