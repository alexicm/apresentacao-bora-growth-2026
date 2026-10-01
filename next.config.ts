import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `npm run build:static` gera uma versão 100% estática em /out (útil para apresentar offline).
  output: process.env.STATIC_EXPORT ? "export" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  // O indicador de dev do Next sobrepõe o rodapé da apresentação.
  devIndicators: false,
};

export default nextConfig;
