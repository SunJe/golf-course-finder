import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "이용 고지",
  description:
    "GolfMap Korea 골프장 정보는 참고용이며, 요금·운영 정보는 예약 전 공식 홈페이지에서 확인하세요.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <StaticPageLayout title="이용 고지">
      <p>
        GolfMap Korea에 게시된 골프장 정보는 이용자의 편의를 위해 제공되는
        <strong> 참고용 정보</strong>입니다. 예약·결제·방문 전 반드시 해당
        골프장의 공식 홈페이지나 예약 채널에서 최신 정보를 확인하시기
        바랍니다.
      </p>

      <h2>요금·운영 정보</h2>
      <ul>
        <li>
          표시된 요금은 참고용이며, 날짜·시간대·시즌·이벤트·예약 채널에 따라
          달라질 수 있습니다.
        </li>
        <li>
          영업 시간, 휴장일, 코스 운영, 캐디·카트 정책 등은 골프장 사정에
          따라 변경될 수 있습니다.
        </li>
        <li>
          서비스는 요금·예약의 정확성, 가용 슬롯, 환불 조건 등을 보장하지
          않습니다.
        </li>
      </ul>

      <h2>위치·연락처 정보</h2>
      <p>
        주소, 전화번호, 홈페이지 URL 등은 공개 자료·제보·데이터 수집 과정을
        거쳐 정리됩니다. 오류가 있을 수 있으므로 방문·연락 전 공식 정보를
        우선 확인해 주세요.
      </p>

      <h2>추천·분류 목록</h2>
      <p>
        지역별·조건별 골프장 목록(컬렉션)은 서비스 데이터 기준으로 정리된
        참고 목록입니다. 개인의 실력, 선호, 코스 상태에 따라 체감은 달라질
        수 있습니다.
      </p>

      <h2>오류 신고</h2>
      <p>
        잘못된 정보를 발견하셨다면{" "}
        <Link href="/contact">문의 페이지</Link> 또는{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
        로 알려 주세요. 골프장 이름, 해당 페이지 URL, 올바른 정보 출처를
        함께 보내 주시면 검토에 도움이 됩니다.
      </p>

      <h2>면책</h2>
      <p>
        서비스 이용 또는 게시 정보를 신뢰하여 발생한 손해에 대해 운영자는
        법령이 허용하는 범위를 넘어 책임지지 않습니다.
      </p>
    </StaticPageLayout>
  );
}
