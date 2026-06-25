import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased max-md:bg-app-warm md:bg-white">
        <HomeResetProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </HomeResetProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
