import Link from "next/link";

import type { BlogPost, BlogPostSection } from "@/lib/blogPosts";

import { BlogCourseCard } from "@/components/BlogCourseCard";
import { BlogRelatedPosts } from "@/components/BlogRelatedPosts";



function itemHref(item: NonNullable<BlogPostSection["items"]>[number]): string | null {

  if (item.relatedCourseId) return `/courses/${item.relatedCourseId}`;

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

  relatedCourseId: string;

} {

  return Boolean(item.relatedCourseId);

}



export function BlogPostBody({ post }: { post: BlogPost }) {

  return (

    <div className="prose prose-stone max-w-none">

      {post.sections.map((section) => (

        <section key={section.heading} className="mt-10 first:mt-0">

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

          {section.items && section.items.length > 0 && (

            <ol className="mt-4 list-none space-y-4 p-0">

              {section.items.map((item, index) => (

                <li key={item.title}>

                  {isCourseItem(item) ? (

                    <BlogCourseCard item={item} rank={index + 1} />

                  ) : (

                    <BlogLinkCard item={item} index={index} />

                  )}

                </li>

              ))}

            </ol>

          )}

        </section>

      ))}

      {post.relatedPostSlugs && post.relatedPostSlugs.length > 0 && (
        <BlogRelatedPosts slugs={post.relatedPostSlugs} />
      )}
    </div>

  );

}

