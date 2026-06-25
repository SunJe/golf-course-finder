"use client";

import { useEffect, useMemo, useRef } from "react";
import type { BlogPost } from "@/lib/blogPosts";
import BlogCard from "@/components/BlogCard";

const AUTO_SCROLL_MS = 5000;
const ITEMS_PER_PAGE = 4;

const SWIPE_ROW_CLASS =
  "flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function chunkPosts(posts: BlogPost[], size: number): BlogPost[][] {
  const pages: BlogPost[][] = [];
  for (let i = 0; i < posts.length; i += size) {
    pages.push(posts.slice(i, i + size));
  }
  return pages;
}

interface HomeBlogCarouselProps {
  posts: BlogPost[];
}

export default function HomeBlogCarousel({ posts }: HomeBlogCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pauseRef = useRef(false);
  const pages = useMemo(() => chunkPosts(posts, ITEMS_PER_PAGE), [posts]);

  useEffect(() => {
    if (pages.length <= 1) return;

    const advance = () => {
      if (pauseRef.current) return;

      const el = scrollRef.current;
      if (!el) return;

      const pageWidth = el.clientWidth;
      if (pageWidth <= 0) return;

      const atLastPage =
        el.scrollLeft + pageWidth >= el.scrollWidth - pageWidth * 0.5;

      el.scrollTo({
        left: atLastPage ? 0 : el.scrollLeft + pageWidth,
        behavior: "smooth",
      });
    };

    const interval = window.setInterval(advance, AUTO_SCROLL_MS);
    return () => window.clearInterval(interval);
  }, [pages.length]);

  return (
    <div
      ref={scrollRef}
      className={SWIPE_ROW_CLASS}
      onPointerEnter={() => {
        pauseRef.current = true;
      }}
      onPointerLeave={() => {
        pauseRef.current = false;
      }}
      aria-label="블로그 글 목록"
    >
      {pages.map((page, pageIdx) => (
        <div key={pageIdx} className="w-full shrink-0 snap-start">
          <div className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2 md:gap-y-4">
            {page.map((post) => (
              <BlogCard key={post.slug} post={post} size="home" hideCategory />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
