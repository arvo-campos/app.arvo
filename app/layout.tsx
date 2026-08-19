import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Arvo — Caderno de Campo Digital",
  description:
    "Gestão digital de manejos em campos demonstrativos agrícolas.",
  appleWebApp: {
    title: "Arvo",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#C4501C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-arvo-bg font-sans text-arvo-grafite">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
