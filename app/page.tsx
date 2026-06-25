import PortalHero from "@/components/portal/PortalHero";
import HomeRecommendedSection from "@/components/portal/HomeRecommendedSection";
import HomeBlogSection from "@/components/portal/HomeBlogSection";
import { buildHomeMetadata } from "@/lib/seoMetadata";

export const metadata = buildHomeMetadata();

export default function HomePage() {
  return (
    <>
      <PortalHero />
      <HomeRecommendedSection />
      <HomeBlogSection />
    </>
  );
}
