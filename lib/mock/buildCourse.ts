import type { Course, CourseType } from "@/types/course";

const IMAGES = [
  "photo-1535131749006-b7f58c99034b",
  "photo-1587174486073-ae5e5cff23aa",
  "photo-1600783245967-f74d1bb8b6df",
  "photo-1592919505780-303950717480",
  "photo-1611374243147-44a702c2d44c",
  "photo-1519896123502-2c39c0a09c66",
  "photo-1535132011086-b8818f016104",
  "photo-1561498858-1f8a45fd0b25",
  "photo-1606925797300-0b35e9d1794e",
  "photo-1593111774240-d529f12cf4bb",
  "photo-1605144156683-93a3c0c8d2b8",
  "photo-1602025882379-e01cf08baa51",
  "photo-1500932334442-8761ee4810a7",
  "photo-1622396636133-ba43f812bc35",
  "photo-1632946656603-8a3a3f3d3e4f",
];

export function courseImage(index: number): string {
  const id = IMAGES[index % IMAGES.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
}

export interface CourseSeed {
  id: string;
  name: string;
  region: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  holeCount: number;
  courseType: CourseType;
  weekdayGreenFeeMin: number;
  weekendGreenFeeMin: number;
  caddieFee?: number;
  cartFee?: number;
  nightRound?: boolean;
  noCaddie?: boolean;
  twoPlayerAllowed?: boolean;
  resort?: boolean;
  tags?: string[];
  imageIndex?: number;
  description?: string;
  phone?: string;
  hasBooking?: boolean;
}

/** 시드 데이터 → Course 객체 변환 */
export function buildCourse(seed: CourseSeed): Course {
  const slug = seed.id;
  return {
    id: seed.id,
    name: seed.name,
    region: seed.region,
    city: seed.city,
    address: seed.address,
    latitude: seed.latitude,
    longitude: seed.longitude,
    phone: seed.phone ?? `031-${String(200 + (slug.length * 7) % 800).padStart(3, "0")}-${String(1000 + (slug.length * 13) % 9000).padStart(4, "0")}`,
    homepageUrl: `https://example.com/${slug}`,
    bookingUrl:
      seed.hasBooking === false
        ? ""
        : `https://example.com/${slug}/booking`,
    holeCount: seed.holeCount,
    courseType: seed.courseType,
    weekdayGreenFeeMin: seed.weekdayGreenFeeMin,
    weekendGreenFeeMin: seed.weekendGreenFeeMin,
    caddieFee: seed.caddieFee ?? 140000,
    cartFee: seed.cartFee ?? 90000,
    nightRound: seed.nightRound ?? false,
    noCaddie: seed.noCaddie ?? false,
    twoPlayerAllowed: seed.twoPlayerAllowed ?? false,
    resort: seed.resort ?? false,
    tags: seed.tags ?? [],
    imageUrl: courseImage(seed.imageIndex ?? slug.length),
    description:
      seed.description ??
      `${seed.name}은(는) ${seed.region} 지역에서 인기 있는 ${seed.holeCount}홀 ${seed.courseType} 골프장입니다. 코스 컨디션과 접근성을 겸비한 라운드가 가능합니다.`,
    updatedAt: "2026-06-01",
  };
}

export function buildCourses(seeds: CourseSeed[]): Course[] {
  return seeds.map(buildCourse);
}
