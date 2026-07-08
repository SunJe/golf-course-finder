import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "소개",
  description:
    "GolfMap Korea는 전국 골프장 위치, 참고 요금, 연락처, 예약 참고 정보와 블로그 가이드를 한곳에서 비교할 수 있도록 만든 서비스입니다.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <StaticPageLayout title="소개">
      <p>
        <strong>{siteConfig.siteName}</strong>({siteConfig.siteNameKo})는 전국
        골프장 위치와 기본 정보를 비교하기 위한 정보 제공 서비스입니다. 라운드를
        계획할 때 위치, 연락처, 등록된 참고 요금을 빠르게 확인하고, 목적에 맞는
        후보를 좁히는 데 도움을 드립니다.
      </p>

      <h2>무엇을 제공하나요?</h2>
      <ul>
        <li>전국 골프장 위치를 지도와 목록에서 확인</li>
        <li>전화번호, 홈페이지, 주소 등 연락·이동 정보</li>
        <li>등록된 참고 요금 및 예약 참고 링크(있는 경우)</li>
        <li>지역별·조건별 골프장 목록(컬렉션)</li>
        <li>개별 골프장 상세 페이지</li>
        <li>
          <Link href="/blog">블로그 가이드</Link> — 지역별 비교, 장비·초보 팁 등
        </li>
      </ul>

      <h2>정보는 어디서 오나요?</h2>
      <p>
        골프장 정보는 공공 데이터, 한국관광콘텐츠랩 등 관광 콘텐츠 자료, 공식
        홈페이지·지도 서비스, 이용자 제보를 바탕으로 자체 정리·보완하고
        있습니다. 사진 일부는 관광 콘텐츠 자료를 활용하며 출처를 표기합니다.
        데이터가 자동으로 매일 전량 갱신된다고 보장하지는 않습니다.
      </p>

      <h2>참고 요금의 의미</h2>
      <p>
        GolfMap에 표시되는 요금은 <strong>등록된 참고 가격</strong>입니다. 홀
        수·요일·시간대·회원 여부·카트·캐디 조건이 서로 다를 수 있으며, 결제
        금액을 보장하지 않습니다. 실제 예약·결제·방문 전에는 반드시 골프장 공식
        홈페이지나 예약 채널에서 최신 정보를 확인해 주세요.
      </p>

      <h2>이용 시 참고해 주세요</h2>
      <p>
        사용자 후기와 공식 정보는 구분합니다. GolfMap은 확인되지 않은 후기를
        검수 완료된 사실처럼 제시하지 않으며, 난이도·경관·서비스 품질처럼 출처가
        없는 주관 평가는 자동으로 생성하지 않습니다. 자세한 면책은{" "}
        <Link href="/disclaimer">이용 고지</Link>를 참고해 주세요.
      </p>

      <p>
        정보 오류 제보·수정 요청·제휴 문의는{" "}
        <Link href="/contact">문의하기</Link> 페이지(
        {siteConfig.contactEmail})를 이용해 주세요. 현재 광고·제휴 표기가 필요한
        유료 추천을 기본으로 운영하지는 않습니다.
      </p>
    </StaticPageLayout>
  );
}
