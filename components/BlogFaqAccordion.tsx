import { ChevronDown } from "lucide-react";
import type { BlogFaqItem } from "@/lib/blogFaq";

type BlogFaqAccordionProps = {
  heading?: string;
  items: BlogFaqItem[];
};

export function BlogFaqAccordion({
  heading = "자주 묻는 질문",
  items,
}: BlogFaqAccordionProps) {
  if (items.length === 0) return null;

  const headingId = "faq-heading";

  return (
    <section aria-labelledby={headingId} className="mt-10 first:mt-0">
      <h2 id={headingId} className="text-xl font-bold text-stone-900">
        {heading}
      </h2>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => {
          return (
            <details
              key={`${index}-${item.question.slice(0, 24)}`}
              className="group rounded-xl border border-stone-200 bg-white open:border-stone-300 open:shadow-sm"
              {...(index === 0 ? { open: true } : {})}
            >
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 px-4 py-3 text-left outline-none transition hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                  Q{index + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug text-stone-900 sm:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="border-t border-stone-100 px-4 pb-4 pt-3">
                <p className="text-sm leading-relaxed text-stone-700 sm:text-base sm:leading-7">
                  {item.answer}
                </p>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
