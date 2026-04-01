import Link from "next/link";
import { getAllBlogPosts, formatBlogDate } from "@/lib/blog";
import { siteConfig } from "@/lib/site-config";
import type { Metadata } from "next";
import { IconArrowRight, IconCalendar, IconClock } from "@tabler/icons-react";

export const metadata: Metadata = {
  title: "Blog – Encrypted Notes, Privacy & Security Tips",
  description:
    "Explore guides on zero-knowledge encryption, secure note-taking, private notes without login, and why you should ditch cloud note apps. By PU Pad.",
  keywords: [
    "encrypted notes app",
    "secure notes",
    "private notes without login",
    "zero knowledge encryption",
    "best encrypted notes 2026",
    "privacy note taking",
  ],
  alternates: {
    canonical: `${siteConfig.url}/blog`,
  },
  openGraph: {
    type: "website",
    url: `${siteConfig.url}/blog`,
    title: "PU Pad Blog – Privacy, Encryption & Secure Notes",
    description:
      "Guides on zero-knowledge encryption, secure note-taking, and privacy-first tools.",
    siteName: "PU Pad",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PU Pad Blog – Privacy & Secure Notes",
    description:
      "Guides on zero-knowledge encryption, secure note-taking, and privacy-first tools.",
    images: [siteConfig.ogImage],
  },
};

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-primary">
            PU Pad Blog
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Privacy, Encryption &amp; Secure Notes
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            In-depth guides on zero-knowledge encryption, secure note-taking
            apps, and building a truly private digital life — without the
            complexity.
          </p>
        </div>
      </section>

      {/* Post list */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="space-y-0 divide-y divide-border">
          {posts.map((post) => {
            const readingTime = estimateReadingTime(post.content);
            return (
              <article key={post.slug} className="group py-8 first:pt-0">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <IconCalendar className="h-3.5 w-3.5" />
                      <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <IconClock className="h-3.5 w-3.5" />
                      {readingTime} min read
                    </span>
                  </div>
                  <h2 className="mb-2.5 text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mb-4 text-muted-foreground leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2.5">
                    Read article
                    <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </article>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Ready to take private notes?
          </h2>
          <p className="mb-5 text-muted-foreground">
            No account. No tracking. Zero-knowledge encryption, right in your
            browser.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Try PU Pad Free
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
