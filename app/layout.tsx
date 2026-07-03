import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HomeResetProvider } from "@/contexts/HomeResetContext";
import { getSiteUrl, siteConfig, getNaverSiteVerification } from "@/lib/siteConfig";

const ADSENSE_PUBLISHER_ID = "ca-pub-7574651628318443";

const naverSiteVerification = getNaverSiteVerification();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.defaultTitle,
    template: `%s`,
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.siteName,
  other: {
    ...(naverSiteVerification
      ? { "naver-site-verification": naverSiteVerification }
      : {}),
    "google-adsense-account": ADSENSE_PUBLISHER_ID,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
        />
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
