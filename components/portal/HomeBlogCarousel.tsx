"use client";

import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/blogPosts";
import BlogCard from "@/components/BlogCard";

const VISIBLE_COUNT = 4;

function pickRandomPosts(posts: BlogPost[], count: number): BlogPost[] {
  const shuffled = [...posts];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

interface HomeBlogCarouselProps {
  posts: BlogPost[];
}

export default function HomeBlogCarousel({ posts }: HomeBlogCarouselProps) {
  const [visiblePosts, setVisiblePosts] = useState<BlogPost[]>(() =>
    posts.slice(0, VISIBLE_COUNT),
  );

  useEffect(() => {
    setVisiblePosts(pickRandomPosts(posts, VISIBLE_COUNT));
  }, [posts]);

  return (
    <div
      className="grid grid-cols-1 gap-x-12 gap-y-2 md:grid-cols-2 md:gap-y-4"
      aria-label="블로그 글 목록"
    >
      {visiblePosts.map((post) => (
        <BlogCard key={post.slug} post={post} size="home" hideCategory />
      ))}
    </div>
  );
}
