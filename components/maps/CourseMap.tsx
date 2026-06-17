"use client";

import type { CourseMapBaseProps } from "@/types/map";
import { getMapProvider } from "@/lib/mapConfig";
import KakaoCourseMap from "@/components/maps/KakaoCourseMap";
import NaverCourseMap from "@/components/maps/NaverCourseMap";
import CustomKoreaMap from "@/components/maps/CustomKoreaMap";

/**
 * 지도 provider wrapper.
 * 실제 지도 구현은 KakaoCourseMap / NaverCourseMap / CustomKoreaMap 에 위임한다.
 * 골프장 Course 데이터와 지도 provider는 분리되어 있다.
 */
export default function CourseMap(props: CourseMapBaseProps) {
  const provider = getMapProvider();

  switch (provider) {
    case "naver":
      return <NaverCourseMap {...props} />;
    case "custom":
      return <CustomKoreaMap {...props} />;
    case "kakao":
    default:
      return <KakaoCourseMap {...props} />;
  }
}
