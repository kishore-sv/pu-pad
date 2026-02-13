"use client";

import { MarkdownViewer } from "@/components/markdown/markdown-viewer";

type Props = {
  value: string;
};

export function ReadMode({ value }: Props) {
  return (
    <div className="mt-2 h-full overflow-auto rounded-none border bg-card p-3">
      <MarkdownViewer value={value} />
    </div>
  );
}

