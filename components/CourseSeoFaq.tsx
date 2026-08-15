import type { CoursePageFaqItem } from "@/lib/seo/coursePageOverrides";
import { absoluteUrl } from "@/lib/siteConfig";

export function CourseFaqJsonLd({
  courseId,
  items,
}: {
  courseId: string;
  items: CoursePageFaqItem[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(`/courses/${courseId}`)}#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function CourseSeoFaq({
  items,
}: {
  items: CoursePageFaqItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section
      id="course-faq"
      className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm sm:p-6"
    >
      <h2 className="mb-4 text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
        자주 묻는 질문
      </h2>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <details key={item.question} className="group py-3 first:pt-0 last:pb-0">
            <summary className="cursor-pointer list-none pr-6 text-sm font-semibold leading-relaxed text-gray-900 marker:content-none sm:text-base">
              {item.question}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
