import type { Metadata } from "next";
import {
  JetBrains_Mono,
  Fira_Code,
  Source_Code_Pro,
  IBM_Plex_Mono,
  Inconsolata,
} from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  weight: ["400", "500"],
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  weight: ["400", "500"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  variable: "--font-inconsolata",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CodeText — 코드를 아름다운 이미지로",
  description: "코드를 아름다운 이미지로 — 신택스 하이라이팅 PNG 생성기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={[
        jetbrainsMono.variable,
        firaCode.variable,
        sourceCodePro.variable,
        ibmPlexMono.variable,
        inconsolata.variable,
        "h-full antialiased",
      ].join(" ")}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
