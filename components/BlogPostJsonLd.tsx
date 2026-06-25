import type { BlogPost } from "@/lib/blogPosts";
import { absoluteUrl, siteConfig } from "@/lib/siteConfig";

function compactJsonLd(value: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) =>
        entry !== undefined &&
        entry !== null &&
        entry !== "" &&
        !(Array.isArray(entry) && entry.length === 0),
    ),
  );
}

function collectCourseItems(post: BlogPost) {
  const items: Array<{
    title: string;
    relatedCourseId: string;
    address?: string;
    phone?: string;
    homepage?: string;
    image?: string;
  }> = [];

  for (const section of post.sections) {
    for (const item of section.items ?? []) {
      if (!item.relatedCourseId) continue;
      items.push({
        title: item.title,
        relatedCourseId: item.relatedCourseId,
        address: item.address,
        phone: item.phone,
        homepage: item.homepage,
        image: item.image,
      });
    }
  }

  return items;
}

interface BlogPostJsonLdProps {
  post: BlogPost;
}

/** 블로그 상세 BlogPosting + 추천 골프장 ItemList JSON-LD */
export default function BlogPostJsonLd({ post }: BlogPostJsonLdProps) {
  const pageUrl = absoluteUrl(`/blog/${post.slug}`);
  const imageUrl = absoluteUrl(post.thumbnail);
  const courseItems = collectCourseItems(post);

  const articleLd = compactJsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    image: [imageUrl],
    author: {
      "@type": "Organization",
      name: siteConfig.siteName,
      url: absoluteUrl("/"),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.siteName,
      url: absoluteUrl("/"),
    },
    articleSection: post.categoryLabel,
    inLanguage: "ko-KR",
  });

  const graph: Record<string, unknown>[] = [articleLd];

  if (courseItems.length > 0) {
    graph.push(
      compactJsonLd({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${post.title} 추천 골프장`,
        description: post.description,
        numberOfItems: courseItems.length,
        itemListElement: courseItems.map((item, index) =>
          compactJsonLd({
            "@type": "ListItem",
            position: index + 1,
            item: compactJsonLd({
              "@type": "SportsActivityLocation",
              name: item.title,
              url: absoluteUrl(`/courses/${item.relatedCourseId}`),
              address: item.address,
              telephone: item.phone,
              sameAs: item.homepage,
              image: item.image ? absoluteUrl(item.image) : undefined,
            }),
          }),
        ),
      }),
    );
  }

  const jsonLd =
    graph.length === 1
      ? articleLd
      : {
          "@context": "https://schema.org",
          "@graph": graph,
        };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
