"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import remarkGfm from "remark-gfm";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import rehypeSanitize from "rehype-sanitize";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import rehypeHighlight from "rehype-highlight";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
});

type Props = {
  value: string;
};

export function MarkdownViewer({ value }: Props) {
  return (
    <Suspense
      fallback={
        <div className="h-32 w-full animate-pulse rounded-none bg-muted" />
      }
    >
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        >
          {value}
        </ReactMarkdown>
      </div>
    </Suspense>
  );
}

