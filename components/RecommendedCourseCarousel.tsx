"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type RecommendedCarouselItem = {
  id: string;
  name: string;
  locationLabel: string;
  priceLabel: string;
  imagePath: string;
};

const AUTO_SCROLL_MS = 2500;
const GAP_PX = 20;
const CARD_HEIGHT_PX = 220;
const TRANSITION_MS = 600;

const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700";

function getCardFlexBasis(viewportWidth: number): string {
  if (viewportWidth >= 1024) {
    return "clamp(190px, calc((100% - 80px) / 5), 220px)";
  }
  if (viewportWidth >= 768) {
    return `calc((100% - ${GAP_PX * 2}px) / 3)`;
  }
  if (viewportWidth >= 640) {
    return `calc((100% - ${GAP_PX}px) / 2)`;
  }
  return `min(82%, 280px)`;
}

interface RecommendedCourseCarouselProps {
  courses: RecommendedCarouselItem[];
}

export default function RecommendedCourseCarousel({
  courses,
}: RecommendedCourseCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);
  const indexRef = useRef(0);

  const [cardFlexBasis, setCardFlexBasis] = useState(
    "clamp(190px, calc((100% - 80px) / 5), 220px)",
  );
  const [stepPx, setStepPx] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [offsetPx, setOffsetPx] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const measure = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const width = viewport.clientWidth;
      setCardFlexBasis(getCardFlexBasis(width));

      const card = viewport.querySelector<HTMLElement>("[data-course-card]");
      if (!card) return;

      const step = card.getBoundingClientRect().width + GAP_PX;
      const visible = Math.max(1, Math.floor((width + GAP_PX) / step));
      const max = Math.max(0, courses.length - visible);

      setStepPx(step);
      setMaxIndex(max);

      const clamped = Math.min(indexRef.current, max);
      indexRef.current = clamped;
      setOffsetPx(clamped * step);
      setAnimate(false);
      requestAnimationFrame(() => setAnimate(true));
    };

    measure();
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [courses.length]);

  useEffect(() => {
    if (courses.length <= 1 || maxIndex <= 0 || stepPx <= 0) return;

    const advance = () => {
      if (pauseRef.current) return;

      const next =
        indexRef.current >= maxIndex ? 0 : indexRef.current + 1;

      if (next === 0 && indexRef.current >= maxIndex) {
        setAnimate(false);
        indexRef.current = 0;
        setOffsetPx(0);
        requestAnimationFrame(() => setAnimate(true));
        return;
      }

      indexRef.current = next;
      setOffsetPx(next * stepPx);
    };

    const interval = window.setInterval(advance, AUTO_SCROLL_MS);
    return () => window.clearInterval(interval);
  }, [courses.length, maxIndex, stepPx]);

  return (
    <div
      ref={viewportRef}
      className="overflow-hidden"
      onPointerEnter={() => {
        pauseRef.current = true;
      }}
      onPointerLeave={() => {
        pauseRef.current = false;
      }}
    >
      <div
        className="flex flex-nowrap will-change-transform"
        style={{
          gap: GAP_PX,
          transform: `translate3d(${-offsetPx}px, 0, 0)`,
          transition: animate
            ? `transform ${TRANSITION_MS}ms ease-in-out`
            : "none",
        }}
        aria-label="추천 골프장 목록"
      >
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            data-course-card
            aria-label={`${course.name} 상세보기`}
            style={{
              flex: `0 0 ${cardFlexBasis}`,
              height: CARD_HEIGHT_PX,
            }}
            className={`group block shrink-0 focus:outline-none ${FOCUS_RING}`}
          >
            <article className="flex h-full flex-col">
              <div className="relative h-[118px] w-full shrink-0 overflow-hidden rounded-2xl bg-emerald-50">
                <Image
                  src={course.imagePath}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover object-center transition duration-300 group-hover:scale-[1.02]"
                  draggable={false}
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col pt-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="line-clamp-1 text-base font-bold text-slate-950 group-hover:text-emerald-700">
                    {course.name}
                  </h3>
                  <span
                    className="shrink-0 text-lg leading-none text-slate-300 transition group-hover:text-emerald-700"
                    aria-hidden
                  >
                    ›
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                  {course.locationLabel}
                </p>
                <p className="mt-3 text-right text-sm font-semibold text-emerald-700">
                  {course.priceLabel}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
