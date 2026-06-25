"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BlogPost } from "@/lib/blogPosts";
import BlogCard from "@/components/BlogCard";

const AUTO_SCROLL_MS = 5000;
const ITEMS_PER_PAGE = 4;
const TRANSITION_MS = 600;

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
  const pauseRef = useRef(false);
  const indexRef = useRef(0);
  const pages = useMemo(() => chunkPosts(posts, ITEMS_PER_PAGE), [posts]);
  const [pageIndex, setPageIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (pages.length <= 1) return;

    const advance = () => {
      if (pauseRef.current) return;

      const next = indexRef.current >= pages.length - 1 ? 0 : indexRef.current + 1;

      if (next === 0 && indexRef.current >= pages.length - 1) {
        setAnimate(false);
        indexRef.current = 0;
        setPageIndex(0);
        requestAnimationFrame(() => setAnimate(true));
        return;
      }

      indexRef.current = next;
      setPageIndex(next);
    };

    const interval = window.setInterval(advance, AUTO_SCROLL_MS);
    return () => window.clearInterval(interval);
  }, [pages.length]);

  return (
    <div
      className="overflow-hidden"
      onPointerEnter={() => {
        pauseRef.current = true;
      }}
      onPointerLeave={() => {
        pauseRef.current = false;
      }}
      aria-label="블로그 글 목록"
    >
      <div
        className="flex will-change-transform"
        style={{
          transform: `translate3d(-${pageIndex * 100}%, 0, 0)`,
          transition: animate
            ? `transform ${TRANSITION_MS}ms ease-in-out`
            : "none",
        }}
      >
        {pages.map((page, pageIdx) => (
          <div
            key={pageIdx}
            className="w-full shrink-0"
            aria-hidden={pageIdx !== pageIndex}
          >
            <div className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2 md:gap-y-4">
              {page.map((post) => (
                <BlogCard key={post.slug} post={post} size="home" hideCategory />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
