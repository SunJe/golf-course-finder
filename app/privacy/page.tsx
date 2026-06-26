import { redirect } from "next/navigation";

/** @deprecated /privacy-policy 로 통합 */
export default function PrivacyRedirectPage() {
  redirect("/privacy-policy");
}
