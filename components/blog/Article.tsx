import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { formatBlogDate } from "@/lib/blog";
import Link from "next/link";
import { IconArrowLeft, IconCalendar, IconClock } from "@tabler/icons-react";

interface ArticleProps {
  title: string;
  description: string;
  date: string;
  content: string;
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function Article({ title, description, date, content }: ArticleProps) {
  const readingTime = estimateReadingTime(content);

  return (
    <article className="w-full">
      {/* Back navigation */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <IconArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Blog
        </Link>
      </div>

      {/* Article header */}
      <header className="mb-10 border-b border-border pb-8">
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mb-5 text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <IconCalendar className="h-4 w-4" />
            <time dateTime={date}>{formatBlogDate(date)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="h-4 w-4" />
            {readingTime} min read
          </span>
        </div>
      </header>

      {/* Article body */}
      <div className="blog-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Article footer */}
      <footer className="mt-16 border-t border-border pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <IconArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to all posts
          </Link>
          <Link
            href="https://pupad.kishore-sv.me"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
          >
            Try PU Pad Free
          </Link>
        </div>
      </footer>
    </article>
  );
}
