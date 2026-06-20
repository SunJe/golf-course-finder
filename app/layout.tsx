import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { HomeResetProvider } from "@/contexts/HomeResetContext";
import { buildNaverSiteVerificationMetadata } from "@/lib/seoMetadata";
import { getSiteUrl, siteConfig } from "@/lib/siteConfig";

const naverVerification = buildNaverSiteVerificationMetadata();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s`,
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.siteName,
  ...(naverVerification ?? {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900 antialiased max-md:bg-app-warm md:bg-white">
        <HomeResetProvider>
          <Header />
          <main>{children}</main>
        </HomeResetProvider>
      </body>
    </html>
  );
}
