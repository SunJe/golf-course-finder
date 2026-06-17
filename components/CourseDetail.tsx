"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  CalendarCheck,
  Flag,
  Moon,
  UserX,
  Users,
  Building2,
  Sun,
  CircleDollarSign,
  ExternalLink,
  Navigation,
  MessageSquareText,
} from "lucide-react";
import type { Course } from "@/types/course";
import { formatPrice, formatDate } from "@/lib/format";
import {
  getKakaoMapSearchUrl,
  getNaverMapSearchUrl,
} from "@/lib/externalMapLinks";
import Tag from "@/components/Tag";
import CourseMap from "@/components/maps/CourseMap";

function InfoStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Flag;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="truncate text-sm font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function Availability({
  label,
  available,
  icon: Icon,
}: {
  label: string;
  available: boolean;
  icon: typeof Flag;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        available
          ? "border-brand-200 bg-brand-50/70"
          : "border-gray-100 bg-gray-50/60"
      }`}
    >
      <span
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ${
          available ? "bg-brand-600 text-white" : "bg-white text-gray-300"
        }`}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div>
        <div className="text-sm font-bold text-gray-900">{label}</div>
        <div
          className={`text-xs font-medium ${
            available ? "text-brand-700" : "text-gray-400"
          }`}
        >
          {available ? "가능" : "불가"}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-lg font-bold text-gray-900">{children}</h2>
  );
}

const TYPE_STYLES: Record<string, string> = {
  대중제: "bg-brand-50 text-brand-700",
  회원제: "bg-indigo-50 text-indigo-700",
  "군 골프장": "bg-amber-50 text-amber-700",
  기타: "bg-gray-100 text-gray-600",
};

export default function CourseDetail({ course }: { course: Course }) {
  const nearby = [
    { name: `${course.city} 시내`, desc: "맛집 · 카페 밀집 지역", icon: MapPin },
    { name: "인근 숙박시설", desc: course.resort ? "리조트 내 숙박 가능" : "차량 15분 거리 호텔", icon: Building2 },
    { name: "주변 관광지", desc: `${course.region} 대표 명소`, icon: Navigation },
  ];

  const blogReviews = [
    { title: `${course.name} 라운드 후기 - 코스 컨디션 총정리`, author: "골프블로거 라운드킹" },
    { title: `주말 ${course.name} 다녀왔어요 (그린피/맛집 정보)`, author: "주말골퍼J" },
    { title: `초보가 본 ${course.name}, 난이도와 팁`, author: "버디찾아삼만리" },
  ];

  const searchUrl = `https://search.naver.com/search.naver?query=${encodeURIComponent(
    course.name + " 골프장 후기",
  )}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        목록으로 돌아가기
      </Link>

      {/* Hero 이미지 */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.imageUrl}
          alt={course.name}
          className="h-56 w-full object-cover sm:h-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                TYPE_STYLES[course.courseType]
              }`}
            >
              {course.courseType}
            </span>
            <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-800">
              {course.region}
            </span>
            <span className="rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-gray-800">
              {course.holeCount}홀
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white drop-shadow-sm sm:text-3xl">
            {course.name}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-4 w-4" />
            {course.address}
          </p>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <a
          href={`tel:${course.phone}`}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <Phone className="h-4 w-4" />
          전화
        </a>
        <a
          href={course.homepageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <Globe className="h-4 w-4" />
          홈페이지
        </a>
        <a
          href={course.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white transition hover:bg-brand-700 sm:col-span-1"
        >
          <CalendarCheck className="h-4 w-4" />
          예약하기
        </a>
      </div>

      {/* 외부 지도 링크 */}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={getKakaoMapSearchUrl(course)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#fee500] hover:bg-[#fee500]/10"
        >
          <ExternalLink className="h-4 w-4" />
          카카오맵에서 보기
        </a>
        <a
          href={getNaverMapSearchUrl(course)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-[#03c75a] hover:bg-[#03c75a]/5 hover:text-[#03c75a]"
        >
          <ExternalLink className="h-4 w-4" />
          네이버지도에서 보기
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* 기본 정보 */}
          <section className="mb-8">
            <SectionTitle>기본 정보</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <InfoStat label="홀수" value={`${course.holeCount}홀`} icon={Flag} />
              <InfoStat
                label="운영 방식"
                value={course.courseType}
                icon={Building2}
              />
              <InfoStat
                label="주중 그린피"
                value={formatPrice(course.weekdayGreenFeeMin)}
                icon={Sun}
              />
              <InfoStat
                label="주말 그린피"
                value={formatPrice(course.weekendGreenFeeMin)}
                icon={CircleDollarSign}
              />
              <InfoStat
                label="카트비"
                value={formatPrice(course.cartFee)}
                icon={Navigation}
              />
              <InfoStat
                label="캐디피"
                value={formatPrice(course.caddieFee)}
                icon={Users}
              />
            </div>
          </section>

          {/* 편의 정보 */}
          <section className="mb-8">
            <SectionTitle>편의 정보</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Availability label="야간 라운드" available={course.nightRound} icon={Moon} />
              <Availability label="노캐디" available={course.noCaddie} icon={UserX} />
              <Availability label="2인 플레이" available={course.twoPlayerAllowed} icon={Users} />
              <Availability label="리조트/숙박" available={course.resort} icon={Building2} />
            </div>
          </section>

          {/* 태그 + 설명 */}
          <section className="mb-8">
            <SectionTitle>골프장 소개</SectionTitle>
            {course.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {course.tags.map((t) => (
                  <Tag key={t} label={t} />
                ))}
              </div>
            )}
            <p className="leading-relaxed text-gray-700">{course.description}</p>
            <p className="mt-3 text-xs text-gray-400">
              최종 업데이트 {formatDate(course.updatedAt)}
            </p>
          </section>

          {/* 블로그 후기 */}
          <section>
            <SectionTitle>블로그 후기</SectionTitle>
            <div className="flex flex-col gap-2">
              {blogReviews.map((r) => (
                <a
                  key={r.title}
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/40"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <MessageSquareText className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-gray-800">
                      {r.title}
                    </div>
                    <div className="text-xs text-gray-400">{r.author}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-300" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* 우측: 지도 + 주변 정보 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <section className="mb-6">
              <SectionTitle>위치</SectionTitle>
              <div className="h-64 w-full">
                <CourseMap courses={[course]} selectedId={course.id} />
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600" />
                {course.address}
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <a
                  href={getKakaoMapSearchUrl(course)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#fee500] hover:bg-[#fee500]/10"
                >
                  <ExternalLink className="h-4 w-4" />
                  카카오맵
                </a>
                <a
                  href={getNaverMapSearchUrl(course)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#03c75a] hover:bg-[#03c75a]/5 hover:text-[#03c75a]"
                >
                  <ExternalLink className="h-4 w-4" />
                  네이버지도
                </a>
              </div>
            </section>

            <section>
              <SectionTitle>주변 정보</SectionTitle>
              <div className="flex flex-col gap-2">
                {nearby.map((n) => (
                  <div
                    key={n.name}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
                      <n.icon className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-800">
                        {n.name}
                      </div>
                      <div className="truncate text-xs text-gray-500">
                        {n.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
