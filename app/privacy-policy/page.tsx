import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = buildStaticPageMetadata({
  title: "개인정보처리방침",
  description:
    "GolfMap Korea 서비스 안내, 수집 정보, 쿠키·Google AdSense 광고 정책 및 문의 방법을 정리했습니다.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <StaticPageLayout title="개인정보처리방침">
      <p>
        GolfMap Korea(이하 &quot;서비스&quot;)는 전국 골프장 정보를 지도와
        목록으로 제공하는 정보 서비스입니다. 본 방침은 서비스 이용 시
        수집될 수 있는 정보와 그 처리 방법을 간단히 설명합니다.
      </p>

      <h2>1. 제공하는 서비스</h2>
      <p>
        서비스는 골프장 위치, 연락처, 참고 요금, 예약 참고 링크, 지역·조건별
        골프장 목록, 블로그 가이드 등을 제공합니다. 정보는 공공 데이터,
        한국관광콘텐츠랩 등 관광 콘텐츠 자료, 자체 정리 데이터를 바탕으로
        운영됩니다. 실제 예약·요금·운영 조건은 변동될 수 있으므로 공식
        홈페이지나 지도 서비스를 통해 확인해 주세요.
      </p>

      <h2>2. 수집할 수 있는 정보</h2>
      <ul>
        <li>
          서비스 이용 과정에서 자동 생성되는 접속 로그, IP 주소, 브라우저
          종류, 기기 정보, 방문 일시, 이용 페이지 등
        </li>
        <li>
          <Link href="/contact">문의하기</Link>를 통해 이메일로 보내 주신
          연락처 및 문의 내용
        </li>
      </ul>
      <p>
        일반적인 지도·목록 탐색만으로는 이름, 전화번호 등 식별 가능한
        개인정보를 별도로 요구하지 않습니다.
      </p>

      <h2>3. 정보 이용 목적</h2>
      <ul>
        <li>서비스 제공·운영·품질 개선</li>
        <li>오류 분석 및 보안 유지</li>
        <li>문의 대응</li>
        <li>방문 통계·성능 분석(익명·집계 형태)</li>
      </ul>

      <h2>4. 쿠키 사용</h2>
      <p>
        서비스는 이용 편의와 통계 분석을 위해 쿠키를 사용할 수 있습니다.
        쿠키는 브라우저에 저장되는 작은 텍스트 파일로, 방문 기록이나 설정
        정보를 기억하는 데 활용될 수 있습니다.
      </p>
      <p>
        이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수
        있습니다. 쿠키를 차단하면 일부 기능이 제한될 수 있습니다.
      </p>

      <h2>5. Google AdSense 및 제3자 광고</h2>
      <p>
        서비스는 Google AdSense 등 제3자 광고를 게재할 수 있습니다. Google
        및 광고 제공업체는 쿠키, 웹 비콘, IP 주소 등을 사용해 맞춤 광고
        제공, 광고 효과 측정, 서비스 개선에 활용할 수 있습니다.
      </p>
      <p>
        Google 맞춤 광고는{" "}
        <a
          href="https://adssettings.google.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google 광고 설정
        </a>
        에서 관리할 수 있습니다. 제3자 제공업체의 쿠키 사용에 대한 자세한
        내용은 각 업체의 정책을 참고해 주세요.
      </p>

      <h2>6. 분석·성능 측정</h2>
      <p>
        서비스는 Vercel Analytics 및 Vercel Speed Insights를 사용할 수
        있습니다. 이 도구들은 방문 수, 페이지 성능 등을 파악하는 데
        활용되며, 개인을 직접 식별하지 않는 형태로 처리될 수 있습니다.
      </p>

      <h2>7. 정보 보관 및 문의</h2>
      <p>
        수집된 정보는 목적 달성에 필요한 기간 동안 보관하며, 관련 법령에
        따른 보관 의무가 없는 경우 지체 없이 파기합니다. 개인정보 관련
        문의는 아래 이메일로 연락해 주세요.
      </p>
      <p>
        문의 이메일:{" "}
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail}
        </a>
      </p>

      <h2>8. 방침 변경</h2>
      <p>
        본 방침은 서비스 정책 또는 관련 법령 변경에 따라 수정될 수 있으며,
        변경 시 본 페이지에 게시합니다.
      </p>

      <p className="text-xs text-stone-500">시행일: 2026년 6월 26일</p>
    </StaticPageLayout>
  );
}
