import { getCoursesForStaticPages } from "@/lib/courseRepository";
import { selectRecommendedCourses } from "@/lib/recommendedCourses";
import { resolveHomeRecommendedThumbnail } from "@/lib/homeThumbnails";
import { formatCourseLocationLabel } from "@/lib/regionUtils";
import {
  formatHomeCarouselPrice,
  hasPrice,
  PRICE_UNAVAILABLE,
} from "@/lib/priceFormat";import PortalSection from "@/components/portal/PortalSection";
import RecommendedCourseCarousel from "@/components/RecommendedCourseCarousel";

export default async function HomeRecommendedSection() {
  const courses = await getCoursesForStaticPages();
  const recommended = selectRecommendedCourses(courses);

  if (recommended.length === 0) return null;

  const carouselItems = recommended.map((meta) => {
    const { course } = meta;
    const priceLabel = hasPrice(course)
      ? formatHomeCarouselPrice(course)
      : PRICE_UNAVAILABLE;
    return {
      id: course.id,
      name: course.changeNameTo?.trim() || course.name,
      locationLabel: formatCourseLocationLabel(course),
      priceLabel,
      imagePath: resolveHomeRecommendedThumbnail(course.id),
    };
  });

  return (
    <PortalSection
      id="recommended"
      title="추천 골프장"
      description="처음 방문하신 분들을 위해 접근성, 정보 완성도, 가격 정보를 기준으로 골라봤어요."
      actionHref="/recommended"
      actionLabel="전체보기"
    >
      <RecommendedCourseCarousel courses={carouselItems} />
    </PortalSection>
  );
}

export async function loadRecommendedCourses() {
  const courses = await getCoursesForStaticPages();
  return selectRecommendedCourses(courses);
}
