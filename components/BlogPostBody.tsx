import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

import type { BlogPost, BlogPostSection } from "@/lib/blogPosts";

import { BlogCourseCard } from "@/components/BlogCourseCard";
import { BlogGearCard } from "@/components/BlogGearCard";
import { BlogRelatedPosts } from "@/components/BlogRelatedPosts";



function itemHref(item: NonNullable<BlogPostSection["items"]>[number]): string | null {

  if (item.relatedCourseId) return `/courses/${item.relatedCourseId}`;

  if (item.relatedPostSlug) return `/blog/${item.relatedPostSlug}`;

  if (item.relatedCollectionSlug) return `/collections/${item.relatedCollectionSlug}`;

  if (item.relatedRegionSlug) return `/regions/${item.relatedRegionSlug}`;

  return null;

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

  return (

    <div className="w-full max-w-none">

      {post.sections.map((section, sectionIndex) => (

        <Fragment key={section.heading}>

        <section className="mt-10 first:mt-0">

          {section.image ? (
            <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200/80 bg-stone-100">
              <Image
                src={section.image}
                alt={section.imageAlt ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
          ) : null}

          <h2 className="text-xl font-bold text-stone-900">{section.heading}</h2>

          {section.body.length > 0 && (

            <div className="mt-4 space-y-3">

              {section.body.map((paragraph) => (

                <p

                  key={paragraph.slice(0, 40)}

                  className="text-base leading-relaxed text-stone-700"

                >

                  {paragraph}

                </p>

              ))}

            </div>

          )}

          {section.table && (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                {section.table.caption ? (
                  <caption className="sr-only">{section.table.caption}</caption>
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

          {section.items && section.items.length > 0 && (

            <ol className="mt-4 list-none space-y-4 p-0">

              {section.items.map((item, index) => (

                <li key={item.title}>

                  {isCourseItem(item) ? (

                    <BlogCourseCard item={item} rank={index + 1} />

                  ) : isGearItem(item) ? (

                    <BlogGearCard item={item} rank={index + 1} />

                  ) : (

                    <BlogLinkCard item={item} index={index} />

                  )}

                </li>

              ))}

            </ol>

          )}

        </section>

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

      ))}

      {post.relatedPostSlugs && post.relatedPostSlugs.length > 0 && (
        <BlogRelatedPosts slugs={post.relatedPostSlugs} />
      )}
    </div>

  );

}

