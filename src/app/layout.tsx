import type { Metadata, Viewport } from "next";
import { Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";

// Lexend: geométrica larga — a alternativa gratuita mais próxima da Altone (fonte comercial do site da BORA).
const sans = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

// Geist Mono: camada de dados — números de simulação, índices, tags de status.
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BORA Growth · Pack de Ações e Projetos para a BORA Brasil",
  description:
    "Apresentação estratégica interativa com as ações e projetos de growth para a BORA Brasil: o que já está rodando, o que está no backlog e o que ainda é ideia.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#080907",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
