import type { ReactNode } from "react";

interface StaticPageLayoutProps {
  title: string;
  children: ReactNode;
}

export default function StaticPageLayout({
  title,
  children,
}: StaticPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="rounded-2xl border border-region-soft-border bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-region-ink sm:text-3xl">
          {title}
        </h1>
        <div className="prose-static mt-6">{children}</div>
      </article>
    </div>
  );
}
