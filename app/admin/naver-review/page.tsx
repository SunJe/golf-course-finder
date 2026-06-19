import { notFound } from "next/navigation";
import NaverReviewClient from "@/components/admin/NaverReviewClient";
import { isReviewAdminEnabled } from "@/lib/enrichment/reviewAccess";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Naver Review (Local Admin)",
  robots: { index: false, follow: false },
};

export default function NaverReviewPage() {
  if (!isReviewAdminEnabled()) {
    notFound();
  }

  return <NaverReviewClient />;
}
