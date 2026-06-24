import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "서비스 소개",
  description:
    "GolfMap Korea는 전국 골프장 위치, 연락처, 홈페이지, 참고 요금을 지도와 목록에서 확인할 수 있는 서비스입니다.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <StaticPageLayout title="서비스 소개">
      <p>
        <strong>GolfMap Korea</strong>(골프맵)는 대한민국 전역 골프장 정보를
        한곳에서 찾아볼 수 있도록 만든 참고용 지도 서비스입니다.
      </p>

      <h2>무엇을 제공하나요?</h2>
      <ul>
        <li>전국 골프장 위치를 지도와 목록에서 확인</li>
        <li>전화번호, 홈페이지, 주소 등 연락·이동 정보</li>
        <li>참고 요금 정보(있는 경우)</li>
        <li>지역별·조건별 골프장 목록(컬렉션)</li>
        <li>개별 골프장 상세 페이지</li>
      </ul>

      <h2>어떻게 활용할 수 있나요?</h2>
      <p>
        라운드 전 골프장 위치와 연락처를 빠르게 확인하거나, 서울 근교·예산·
        초보·백돌이·대중제·나인홀 등 목적에 맞는 골프장 목록을 참고할 수
        있습니다.{" "}
        <Link href="/">전국 골프장 지도</Link>에서 바로 탐색을 시작해 보세요.
      </p>

      <h2>참고 사항</h2>
      <p>
        본 서비스의 정보는 참고용이며, 실제 요금·운영 시간·예약 조건은
        골프장 공식 홈페이지나 예약 채널에서 반드시 확인하시기 바랍니다.
        자세한 내용은 <Link href="/disclaimer">이용 고지</Link>를 참고해
        주세요.
      </p>

      <p>
        정보 수정·제보·광고·제휴 문의는{" "}
        <Link href="/contact">문의 페이지</Link>를 이용해 주세요.
      </p>
    </StaticPageLayout>
  );
}
