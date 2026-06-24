import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "개인정보처리방침",
  description:
    "GolfMap Korea의 개인정보 수집·이용, 분석 도구, Google AdSense 광고 및 쿠키 안내.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticPageLayout title="개인정보처리방침">
      <p>
        GolfMap Korea(이하 &quot;서비스&quot;)는 이용자의 개인정보를
        중요하게 생각합니다. 본 방침은 서비스 이용 시 수집될 수 있는 정보와
        그 처리 방법을 설명합니다.
      </p>

      <h2>1. 수집할 수 있는 정보</h2>
      <ul>
        <li>
          서비스 이용 과정에서 자동 생성되는 접속 로그, IP 주소, 브라우저
          종류, 기기 정보, 방문 일시 등
        </li>
        <li>
          문의 이메일 발송 시 이용자가 직접 제공하는 연락처 및 문의 내용
        </li>
      </ul>
      <p>
        일반적인 지도·목록 탐색만으로는 이름, 전화번호 등 식별 가능한
        개인정보를 별도로 요구하지 않습니다.
      </p>

      <h2>2. 정보 이용 목적</h2>
      <ul>
        <li>서비스 제공·운영·품질 개선</li>
        <li>오류 분석 및 보안 유지</li>
        <li>문의 대응</li>
        <li>통계·분석(익명·집계 형태)</li>
      </ul>

      <h2>3. 분석·성능 측정 도구</h2>
      <p>
        서비스는 Vercel Analytics 및 Vercel Speed Insights를 사용할 수
        있습니다. 이 도구들은 방문 수, 페이지 성능 등 서비스 이용 현황을
        파악하는 데 활용되며, 개인을 직접 식별하지 않는 형태로 처리될 수
        있습니다.
      </p>

      <h2>4. Google AdSense 및 제3자 광고</h2>
      <p>
        서비스는 Google AdSense 등 제3자 광고를 게재할 수 있습니다. Google
        및 광고 파트너는 쿠키, 웹 비콘, IP 주소 등을 사용해 맞춤 광고 제공,
        광고 효과 측정, 서비스 개선에 활용할 수 있습니다.
      </p>
      <p>
        이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수
        있습니다. Google 맞춤 광고 설정은 Google 광고 설정 페이지에서
        관리할 수 있습니다.
      </p>

      <h2>5. 정보 보관 및 파기</h2>
      <p>
        수집된 정보는 목적 달성에 필요한 기간 동안 보관하며, 관련 법령에
        따른 보관 의무가 없는 경우 지체 없이 파기합니다.
      </p>

      <h2>6. 이용자의 권리</h2>
      <p>
        이용자는 개인정보 관련 문의, 열람·정정·삭제 요청을 할 수 있습니다.
        문의:{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
      </p>

      <h2>7. 방침 변경</h2>
      <p>
        본 방침은 서비스 정책 또는 관련 법령 변경에 따라 수정될 수 있으며,
        변경 시 본 페이지에 게시합니다.
      </p>

      <p className="text-xs text-stone-500">시행일: 2026년 6월 24일</p>
    </StaticPageLayout>
  );
}
