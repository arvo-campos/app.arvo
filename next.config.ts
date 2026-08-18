import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem isso, o Next.js bloqueia os arquivos JavaScript do modo de
  // desenvolvimento quando o app é aberto pelo IP da rede local (ex: pelo
  // celular) em vez de "localhost" — a página carrega, mas nada que dependa
  // de JavaScript (menus, botões dinâmicos) funciona.
  // Coringa: libera qualquer endereço "192.168.x.x" (a faixa mais comum de
  // roteador doméstico/Wi-Fi), pra não precisar editar isso de novo toda vez
  // que o computador troca de rede.
  allowedDevOrigins: ["192.168.*.*"],
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
