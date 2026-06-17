import type { Course } from "@/types/course";
import { buildCourses } from "@/lib/mock/buildCourse";
import { SEOUL_GYEONGGI_SEEDS } from "@/lib/mock/seeds/seoulGyeonggi";
import { GANGWON_SEEDS } from "@/lib/mock/seeds/gangwon";
import { CHUNGCHEONG_SEEDS } from "@/lib/mock/seeds/chungcheong";
import { JEOLLA_SEEDS } from "@/lib/mock/seeds/jeolla";
import { GYEONGSANG_SEEDS } from "@/lib/mock/seeds/gyeongsang";
import { JEJU_SEEDS } from "@/lib/mock/seeds/jeju";

/** 지역별 시드를 합쳐 전국 mock 골프장 목록 생성 */
export const MOCK_COURSES: Course[] = buildCourses([
  ...SEOUL_GYEONGGI_SEEDS,
  ...GANGWON_SEEDS,
  ...CHUNGCHEONG_SEEDS,
  ...JEOLLA_SEEDS,
  ...GYEONGSANG_SEEDS,
  ...JEJU_SEEDS,
]);
