import { Fragment } from "react";
import Link from "next/link";

import type { BlogPost, BlogPostSection } from "@/lib/blogPosts";
import { isBlogFaqSection, parseBlogFaqItems } from "@/lib/blogFaq";

import { BlogCourseCard } from "@/components/BlogCourseCard";
import { BlogFaqAccordion } from "@/components/BlogFaqAccordion";
import { BlogGearCard } from "@/components/BlogGearCard";
import { BlogRelatedPosts } from "@/components/BlogRelatedPosts";
import { BlogSectionHeroImage } from "@/components/BlogSectionHeroImage";
import { TournamentMonthCalendar } from "@/components/tournament/TournamentMonthCalendar";
import { TournamentOfficialGallery } from "@/components/tournament/TournamentOfficialGallery";



function itemHref(item: NonNullable<BlogPostSection["items"]>[number]): string | null {

  if (item.relatedCourseId) return `/courses/${item.relatedCourseId}`;

  if (item.relatedPostSlug) return `/blog/${item.relatedPostSlug}`;

  if (item.relatedCollectionSlug) return `/collections/${item.relatedCollectionSlug}`;

  if (item.relatedRegionSlug) return `/regions/${item.relatedRegionSlug}`;

  if (item.relatedHref) return item.relatedHref;

  return null;

}

/** Lightweight inline emphasis for blog body (`**bold**` only). */
function renderInlineMarkup(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`b-${index}`} className="font-semibold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`t-${index}`}>{part}</Fragment>;
  });
}



function BlogLinkCard({

  item,

  index,

}: {

  item: NonNullable<BlogPostSection["items"]>[number];

  index?: number;

}) {

  const href = itemHref(item);

  const inner = (

    <>

      {index != null && (

        <p className="text-xs font-semibold text-brand-700">#{index + 1}</p>

      )}

      <h3 className="mt-3 text-base font-bold text-stone-900">{item.title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-stone-600">

        {item.description}

      </p>

    </>

  );



  if (href) {

    return (

      <Link

        href={href}

        className="block rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:bg-brand-50/30"

      >

        {inner}

      </Link>

    );

  }



  return (

    <div className="rounded-xl border border-stone-200/90 bg-white p-4 shadow-sm">

      {inner}

    </div>

  );

}



function isCourseItem(

  item: NonNullable<BlogPostSection["items"]>[number],

): item is NonNullable<BlogPostSection["items"]>[number] & {

  relatedCourseId?: string;

} {

  return Boolean(
    item.relatedCourseId || item.address || item.phone || item.homepage,
  );

}



function isGearItem(

  item: NonNullable<BlogPostSection["items"]>[number],

): boolean {

  const isCourse = Boolean(

    item.relatedCourseId || item.address || item.phone || item.homepage,

  );

  if (isCourse) return false;

  return Boolean(

    item.image ||

      (item.recommendationReasons && item.recommendationReasons.length > 0) ||

      (item.cons && item.cons.length > 0),

  );

}



export function BlogPostBody({ post }: { post: BlogPost }) {
  const tocItems = post.sections
    .map((section) => section.heading)
    .filter(Boolean);

  return (
    <div className="w-full max-w-none">
      {tocItems.length > 2 ? (
        <details className="mb-8 rounded-xl border border-stone-200 bg-stone-50/70 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-stone-800">
            목차
          </summary>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-stone-600">
            {tocItems.map((heading) => (
              <li key={heading}>
                <a
                  href={`#${encodeURIComponent(heading)}`}
                  className="underline-offset-2 hover:text-brand-800 hover:underline"
                >
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      {post.sections.map((section, sectionIndex) => {
        const faqItems = isBlogFaqSection(section.heading)
          ? parseBlogFaqItems(section.body)
          : [];
        const renderAsFaq = faqItems.length > 0;

        if (renderAsFaq) {
          return (
            <Fragment key={section.heading}>
              <BlogFaqAccordion heading={section.heading} items={faqItems} />
            </Fragment>
          );
        }

        return (
        <Fragment key={section.heading}>

        <section
          id={section.heading}
          className="mt-10 scroll-mt-24 first:mt-0"
        >
          {section.image ? (
            <BlogSectionHeroImage
              src={section.image}
              alt={section.imageAlt ?? ""}
              mobileSrc={section.imageMobile}
              layout={section.imageLayout}
              enableLightbox={section.imageLightbox}
            />
          ) : null}

          <h2 className="text-xl font-bold text-stone-900">{section.heading}</h2>

          {section.body.length > 0 && (

            <div className="mt-4 space-y-3">

              {section.body.map((paragraph) => {
                if (paragraph.startsWith("### ")) {
                  return (
                    <h3
                      key={paragraph.slice(0, 40)}
                      className="pt-2 text-lg font-bold text-stone-900"
                    >
                      {renderInlineMarkup(paragraph.slice(4))}
                    </h3>
                  );
                }

                return (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-base leading-[1.7] text-stone-700 sm:text-[1.05rem]"
                  >
                    {renderInlineMarkup(paragraph)}
                  </p>
                );
              })}

            </div>

          )}

          {section.table && (
            <div className="mt-5 overflow-x-auto rounded-xl border border-stone-200">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                {section.table.caption ? (
                  <caption className="border-b border-stone-100 bg-stone-50 px-3 py-2.5 text-left text-sm font-semibold text-stone-800">
                    {section.table.caption}
                  </caption>
                ) : null}
                <thead>
                  <tr className="border-b-2 border-stone-200 bg-stone-50 text-left">
                    {section.table.columns.map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className="px-3 py-2.5 font-bold text-stone-800"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row) => (
                    <tr
                      key={row[0]}
                      className="border-b border-stone-100 align-top"
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${row[0]}-${cellIndex}`}
                          className={
                            cellIndex === 0
                              ? "px-3 py-2.5 font-semibold text-stone-900"
                              : "px-3 py-2.5 text-stone-700"
                          }
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {section.callout ? (
            <aside className="mt-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-5 sm:p-6">
              <h3 className="text-base font-bold text-stone-900 sm:text-lg">
                {section.callout.title}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {section.callout.items.map((entry) => (
                  <li
                    key={entry}
                    className="flex gap-2.5 text-sm leading-relaxed text-stone-700"
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-600"
                      aria-hidden
                    />
                    <span>{entry}</span>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          {section.items && section.items.length > 0 && (

            <ol className="mt-4 list-none space-y-4 p-0">

              {section.items.map((item, index) => (

                <li key={item.title}>

                  {isCourseItem(item) ? (

                    <BlogCourseCard
                      item={item}
                      rank={post.showItemRank === false ? undefined : index + 1}
                      reasonsHeading={post.reasonsHeading}
                      variant={
                        item.courseCardVariant === "tournament" ||
                        post.category === "tournament-guide"
                          ? "tournament"
                          : "default"
                      }
                      tournamentContext={
                        item.courseCardVariant === "tournament" ||
                        post.category === "tournament-guide"
                          ? {
                              eventName: item.tournamentEventName,
                              eventDates: item.tournamentEventDates,
                              officialEventUrl: item.tournamentOfficialUrl,
                              checkPoints: item.recommendationReasons,
                            }
                          : undefined
                      }
                    />

                  ) : isGearItem(item) ? (

                    <BlogGearCard item={item} rank={index + 1} />

                  ) : (

                    <BlogLinkCard item={item} index={index} />

                  )}

                </li>

              ))}

            </ol>

          )}

          {section.officialPhotoEventSlug ? (
            <TournamentOfficialGallery
              eventSlug={section.officialPhotoEventSlug}
              photoIds={section.officialPhotoIds}
              creditLine={section.officialPhotoCredit}
            />
          ) : null}

        </section>

        {sectionIndex === 0 && post.tournamentCalendarMonth ? (
          <TournamentMonthCalendar monthKey={post.tournamentCalendarMonth} />
        ) : null}

        {sectionIndex === 0 && post.quickConclusion ? (
          <aside className="mt-8 rounded-2xl border border-brand-100 bg-brand-50/60 p-5 sm:p-6">
            <h2 className="text-base font-bold text-brand-900 sm:text-lg">
              {post.quickConclusion.title}
            </h2>
            <ul className="mt-3 space-y-2">
              {post.quickConclusion.items.map((entry) => {
                const separatorIndex = entry.indexOf(": ");
                const hasLabel = separatorIndex > -1;
                const label = hasLabel
                  ? entry.slice(0, separatorIndex)
                  : entry;
                const value = hasLabel ? entry.slice(separatorIndex + 2) : "";
                return (
                  <li
                    key={entry}
                    className="flex gap-2 text-sm leading-relaxed text-stone-700"
                  >
                    <span
                      className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                      aria-hidden
                    />
                    <span>
                      <span className="font-semibold text-stone-900">
                        {label}
                        {hasLabel ? ":" : ""}
                      </span>
                      {value ? ` ${value}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        ) : null}

        </Fragment>
        );
      })}

      {post.dataCheckedAt || (post.references && post.references.length > 0) ? (
        <aside className="mt-10 rounded-2xl border border-stone-200 bg-stone-50/80 p-5 sm:p-6">
          <h2 className="text-base font-bold text-stone-900 sm:text-lg">
            자료 확인 및 참고
          </h2>
          {post.dataCheckedAt ? (
            <p className="mt-2 text-sm text-stone-600">
              자료 확인 기준일: {post.dataCheckedAt}
            </p>
          ) : null}
          {post.references && post.references.length > 0 ? (
            post.references.every(
              (ref) =>
                !ref.title.trim() &&
                !ref.publisher &&
                !ref.checkedAt &&
                !ref.url &&
                Boolean(ref.note?.trim()),
            ) ? (
              <div className="mt-3 space-y-3 text-sm text-stone-500">
                {post.references.map((ref, index) => (
                  <p key={`ref-note-${index}`}>{ref.note}</p>
                ))}
              </div>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-stone-700">
                {post.references.map((ref) => (
                  <li
                    key={`${ref.title}-${ref.checkedAt ?? ""}-${ref.note?.slice(0, 24) ?? ""}`}
                  >
                    {ref.title.trim() ? (
                      <span className="font-semibold text-stone-900">
                        {ref.title}
                      </span>
                    ) : null}
                    {ref.publisher ? ` · ${ref.publisher}` : ""}
                    {ref.checkedAt ? ` · 확인일 ${ref.checkedAt}` : ""}
                    {ref.note ? (
                      <span className="mt-1 block whitespace-pre-line text-stone-500">
                        {ref.note}
                      </span>
                    ) : null}
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-brand-800 underline-offset-2 hover:underline"
                      >
                        원문 보기
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </aside>
      ) : null}

      {post.relatedPostSlugs && post.relatedPostSlugs.length > 0 && (
        <BlogRelatedPosts slugs={post.relatedPostSlugs} />
      )}
    </div>

  );

}

