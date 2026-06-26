import { BLOG_POSTS } from "@/lib/blogPosts";
import type { BlogContentHint } from "@/lib/enrichment/courseContentGenerator";

export function extractBlogContentHints(): Map<string, BlogContentHint> {
  const hints = new Map<string, BlogContentHint>();

  for (const post of BLOG_POSTS) {
    for (const section of post.sections) {
      if (!section.items?.length) continue;

      for (const item of section.items) {
        if (!item.relatedCourseId || !item.description?.trim()) continue;

        const existing = hints.get(item.relatedCourseId);
        if (existing) continue;

        hints.set(item.relatedCourseId, {
          description: item.description.trim(),
          recommendationReasons: item.recommendationReasons,
          blogSlug: post.slug,
          blogTitle: post.title,
          sourceTypes: ["blog", "visitKorea"],
        });
      }
    }
  }

  return hints;
}

export function getBlogContentHint(
  courseId: string,
): BlogContentHint | undefined {
  return extractBlogContentHints().get(courseId);
}
