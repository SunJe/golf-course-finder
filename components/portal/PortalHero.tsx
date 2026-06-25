import Link from "next/link";
import { Map } from "lucide-react";
import SiteContainer from "@/components/layout/SiteContainer";

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

export default function PortalHero() {
  return (
    <section className="border-b border-stone-100 bg-gradient-to-b from-emerald-50/60 to-white">
      <SiteContainer className="py-8 md:py-10">
        <Link
          href="/map"
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900 ${FOCUS_RING}`}
        >
          <Map className="h-4 w-4" aria-hidden />
          골프맵 전체 보기
        </Link>
      </SiteContainer>
    </section>
  );
}
