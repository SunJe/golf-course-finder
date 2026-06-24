import type { Metadata } from "next";
import Link from "next/link";
import StaticPageLayout from "@/components/StaticPageLayout";
import { buildStaticPageMetadata } from "@/lib/seoMetadata";
import { siteConfig } from "@/lib/siteConfig";

const CONTACT_EMAIL = siteConfig.contactEmail;

export const metadata: Metadata = buildStaticPageMetadata({
  title: "문의",
  description:
    "GolfMap Korea 정보 수정, 골프장 제보, 광고·제휴 문의는 이메일로 연락해 주세요.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <StaticPageLayout title="문의">
      <p>
        GolfMap Korea 이용과 관련된 문의는 아래 이메일로 보내 주세요. 가능한
        범위에서 검토 후 답변드리겠습니다.
      </p>

      <h2>연락처</h2>
      <p>
        이메일:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>다음과 같은 문의를 받습니다</h2>
      <ul>
        <li>골프장 정보 수정·보완 요청(주소, 전화번호, 홈페이지, 요금 등)</li>
        <li>누락·오류 골프장 제보</li>
        <li>광고·제휴·협업 문의</li>
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
        <Link href="/privacy">개인정보처리방침</Link>을 확인해 주세요.
      </p>
    </StaticPageLayout>
  );
}
