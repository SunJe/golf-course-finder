import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";
import { siteConfig } from "@/lib/siteConfig";

// TODO: 운영 이메일 확정 시 NEXT_PUBLIC_CONTACT_EMAIL 환경 변수로 설정하세요.
const CONTACT_EMAIL = siteConfig.contactEmail;

export const metadata: Metadata = buildStaticPageMetadata({
  title: "문의하기",
  description:
    "GolfMap Korea 사이트 정보 오류 제보, 골프장 정보 수정 요청, 제휴·문의는 이메일로 연락해 주세요.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <StaticPageLayout title="문의하기">
      <p>
        GolfMap Korea 이용과 관련된 문의는 아래 이메일로 보내 주세요. 가능한
        범위에서 검토 후 답변드리겠습니다.
      </p>

      <h2>문의 이메일</h2>
      <p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>다음과 같은 문의를 받습니다</h2>
      <ul>
        <li>
          <strong>사이트 정보 오류 제보</strong> — 잘못 표시된 페이지, 링크
          오류, UI 문제 등
        </li>
        <li>
          <strong>골프장 정보 수정 요청</strong> — 주소, 전화번호, 홈페이지,
          참고 요금, 운영 정보 등
        </li>
        <li>
          <strong>누락 골프장 제보</strong> — 서비스에 없는 골프장 추가
          요청
        </li>
        <li>
          <strong>제휴·협업 문의</strong> — 광고, 콘텐츠 협업, 데이터
          제휴 등
        </li>
        <li>서비스 이용 관련 일반 문의</li>
      </ul>

      <h2>문의 시 도움이 되는 정보</h2>
      <ul>
        <li>해당 골프장 이름과 GolfMap Korea 페이지 URL(있는 경우)</li>
        <li>수정이 필요한 항목과 올바른 정보 출처(공식 홈페이지 등)</li>
        <li>스크린샷이나 참고 자료(선택)</li>
      </ul>

      <p>
        개인정보 처리에 관한 내용은{" "}
        <Link href="/privacy-policy">개인정보처리방침</Link>을 확인해
        주세요.
      </p>
    </StaticPageLayout>
  );
}
