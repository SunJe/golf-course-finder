import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "소개",
  description:
    "GolfMap Korea는 전국 골프장 위치, 요금, 연락처, 예약 참고 정보와 블로그 가이드를 한곳에서 비교할 수 있도록 만든 서비스입니다.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <StaticPageLayout title="소개">
      <p>
        <strong>GolfMap Korea</strong>(골프맵)는 전국 골프장 정보를 쉽게
        비교할 수 있도록 만든 정보 제공 서비스입니다. 라운드를 계획할 때
        골프장 위치, 연락처, 참고 요금을 빠르게 확인하고, 목적에 맞는
        코스를 찾는 데 도움을 드립니다.
      </p>

      <h2>무엇을 제공하나요?</h2>
      <ul>
        <li>전국 골프장 위치를 지도와 목록에서 확인</li>
        <li>전화번호, 홈페이지, 주소 등 연락·이동 정보</li>
        <li>참고 요금 및 예약 참고 링크(있는 경우)</li>
        <li>지역별·조건별 골프장 목록(컬렉션)</li>
        <li>개별 골프장 상세 페이지</li>
        <li>
          <Link href="/blog">블로그 가이드</Link> — 서울 근교, 지역별,
          장비·초보 팁 등
        </li>
      </ul>

      <h2>정보는 어디서 오나요?</h2>
      <p>
        골프장 정보는 공공 데이터, 한국관광콘텐츠랩 등 관광 콘텐츠 자료,
        공식 홈페이지·지도 서비스, 이용자 제보를 바탕으로 자체 정리·
        보완하고 있습니다. 사진 일부는 관광 콘텐츠 자료를 활용하며 출처를
        표기합니다.
      </p>

      <h2>이용 시 참고해 주세요</h2>
      <p>
        본 서비스의 요금·운영 시간·예약 조건은 <strong>참고용</strong>
        입니다. 실제 예약·결제·방문 전에는 반드시 골프장 공식 홈페이지,
        예약 채널, 네이버·카카오 지도 등에서 최신 정보를 확인해 주세요.
        자세한 내용은 <Link href="/disclaimer">이용 고지</Link>를 참고해
        주세요.
      </p>

      <p>
        정보 오류 제보·수정 요청·제휴 문의는{" "}
        <Link href="/contact">문의하기</Link> 페이지를 이용해 주세요.
      </p>
    </StaticPageLayout>
  );
}
