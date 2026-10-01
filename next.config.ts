import type { NextConfig } from "next";

const isStatic = Boolean(process.env.STATIC_EXPORT);

const nextConfig: NextConfig = {
  // `npm run build:static` gera uma versão 100% estática em /out (útil para apresentar offline).
  output: isStatic ? "export" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  // O indicador de dev do Next sobrepõe o rodapé da apresentação.
  devIndicators: false,
  // A versão publicada vive em /v2; a raiz leva para ela (temporário, para poder trocar de versão depois).
  // Redirects não funcionam no export estático: lá a raiz mostra a apresentação direto.
  ...(isStatic
    ? {}
    : {
        async redirects() {
          return [{ source: "/", destination: "/v2", permanent: false }];
        },
      }),
};

export default nextConfig;
