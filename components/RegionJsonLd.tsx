import type { Course } from "@/types/course";
import type { RegionLandingConfig } from "@/lib/regionLanding";
import { buildRegionFaqItems, computeRegionStats } from "@/lib/regionLanding";
import { absoluteUrl } from "@/lib/siteConfig";

const JSON_LD_LIST_LIMIT = 50;

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

export default function RegionJsonLd({
  config,
  courses,
}: {
  config: RegionLandingConfig;
  courses: Course[];
}) {
  const pageUrl = absoluteUrl(`/regions/${config.slug}`);
  const pageTitle = `${config.label} 골프장 지도`;
  const stats = computeRegionStats(courses);
  const faqItems = buildRegionFaqItems(config.label, stats);

  const itemListElement = courses.slice(0, JSON_LD_LIST_LIMIT).map((course, index) =>
    compactJsonLd({
      "@type": "ListItem",
      position: index + 1,
      name: course.name.trim(),
      url: absoluteUrl(`/courses/${course.id}`),
    }),
  );

  const collectionPage = compactJsonLd({
    "@type": "CollectionPage",
    "@id": `${pageUrl}#webpage`,
    name: pageTitle,
    description: config.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "GolfMap Korea",
      url: absoluteUrl("/"),
    },
  });

  const itemList = compactJsonLd({
    "@type": "ItemList",
    "@id": `${pageUrl}#itemlist`,
    name: `${config.label} 골프장 목록`,
    numberOfItems: courses.length,
    itemListElement,
  });

  const breadcrumbList = compactJsonLd({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "전국 골프장 지도",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${config.label} 골프장`,
        item: pageUrl,
      },
    ],
  });

  const faqPage = compactJsonLd({
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqItems.map((item) =>
      compactJsonLd({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }),
    ),
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [collectionPage, itemList, breadcrumbList, faqPage],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
