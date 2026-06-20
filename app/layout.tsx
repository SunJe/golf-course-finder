import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { HomeResetProvider } from "@/contexts/HomeResetContext";

export const metadata: Metadata = {
  title: "GolfMap Korea — 전국 골프장 지도 검색",
  description:
    "전국 골프장을 지도와 리스트로 한눈에. 지역, 가격, 홀수, 노캐디, 야간 라운드까지 쉽게 비교하세요.",
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
