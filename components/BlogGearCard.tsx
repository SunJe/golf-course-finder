import Image from "next/image";
import type { BlogPostSection } from "@/lib/blogPosts";

type BlogGearItem = NonNullable<BlogPostSection["items"]>[number];

const IMAGE_HEIGHT_CLASS = "h-[200px] sm:h-[220px]";

interface BlogGearCardProps {
  item: BlogGearItem;
  rank: number;
}

export function BlogGearCard({ item, rank }: BlogGearCardProps) {
  const pros = item.recommendationReasons ?? [];
  const cons = item.cons ?? [];
  const imageAlt = item.imageAlt ?? `${item.title} 드라이버`;

  return (
    <article className="w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
      <div className="px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
          #{rank}
        </span>
        <h3 className="mt-3 text-lg font-bold leading-snug text-stone-900 sm:text-xl">
          {item.title}
        </h3>
      </div>

      {item.image ? (
        <div className="border-y border-stone-100 bg-stone-100">
          <div
            className={`relative overflow-hidden bg-stone-100 ${IMAGE_HEIGHT_CLASS}`}
          >
            <Image
              src={item.image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>
          {item.imageCredit ? (
            <p className="border-t border-stone-100 px-4 py-2 text-xs text-stone-500 sm:px-5">
              {item.imageCredit}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm leading-relaxed text-stone-700 sm:text-base">
          {item.description}
        </p>

        {pros.length > 0 ? (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <h4 className="text-sm font-bold text-emerald-800">장점</h4>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              {pros.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span className="shrink-0 text-emerald-600" aria-hidden>
                    +
                  </span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {cons.length > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/80 p-4">
            <h4 className="text-sm font-bold text-amber-900">단점·주의점</h4>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              {cons.map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="shrink-0 text-amber-700" aria-hidden>
                    −
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
