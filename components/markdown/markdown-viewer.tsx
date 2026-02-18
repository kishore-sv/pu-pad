"use client";

import dynamic from "next/dynamic";
import React, { Suspense, useState, useCallback } from "react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { cn } from "@/lib/utils";
import {
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconAlertCircle
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const ReactMarkdown = dynamic(() => import("react-markdown"), {
  ssr: false,
});

//  Custom Components 

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={copy}
      className="h-7 w-7 rounded-md cursor-pointer text-muted-foreground hover:text-foreground bg-secondary shadow-2xs hover:bg-secondary/50 transition-colors"
      title="Copy code"
    >
      {copied ? (
        <IconCheck className="size-3.5 text-green-500" />
      ) : (
        <IconCopy className="size-3.5" />
      )}
    </Button>
  );
};

const Callout = ({
  children,
  type = "default",
  className
}: {
  children: React.ReactNode;
  type?: "default" | "info" | "warning" | "danger" | "success";
  className?: string;
}) => {
  const icons = {
    default: <IconInfoCircle className="size-5 text-muted-foreground" />,
    info: <IconInfoCircle className="size-5 text-blue-500" />,
    warning: <IconAlertTriangle className="size-5 text-yellow-500" />,
    danger: <IconAlertCircle className="size-5 text-red-500" />,
    success: <IconCircleCheck className="size-5 text-green-500" />,
  };

  const borders = {
    default: "border-border bg-muted/30",
    info: "border-blue-500/30 bg-blue-500/5",
    warning: "border-yellow-500/30 bg-yellow-500/5",
    danger: "border-red-500/30 bg-red-500/5",
    success: "border-green-500/30 bg-green-500/5",
  };

  return (
    <div className={cn(
      "my-6 flex items-start gap-3 rounded-none border border-l-4 p-4",
      borders[type],
      type !== "default" && "border-l-current",
      className
    )}>
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm leading-relaxed prose-p:my-0">
        {children}
      </div>
    </div>
  );
};

const Table = ({ className, ...props }: React.ComponentProps<"table">) => (
  <div className="my-6 w-full overflow-x-auto border border-border">
    <table className={cn("w-full border-collapse text-sm", className)} {...props} />
  </div>
);

const Th = ({ className, ...props }: React.ComponentProps<"th">) => (
  <th
    className={cn(
      "border-b border-border bg-muted/50 px-4 py-3 text-left font-semibold text-foreground uppercase tracking-wider",
      className
    )}
    {...props}
  />
);

const Td = ({ className, ...props }: React.ComponentProps<"td">) => (
  <td
    className={cn(
      "border-b border-border px-4 py-3 text-left leading-relaxed",
      className
    )}
    {...props}
  />
);

const Pre = ({ children, ...props }: any) => {
  const preRef = React.useRef<HTMLPreElement>(null);
  const [text, setText] = useState("");

  React.useEffect(() => {
    if (preRef.current) {
      setText(preRef.current.innerText || "");
    }
  }, [children]);

  return (
    <div className="group relative rounded-md my-6 overflow-hidden border border-border bg-muted/40 font-mono text-sm">
      <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={text} />
      </div>
      <pre ref={preRef} className="m-0 overflow-x-auto p-4 leading-relaxed" {...props}>
        {children}
      </pre>
    </div>
  );
};

const CustomComponents: any = {
  h1: ({ className, ...props }: any) => (
    <h1 className={cn("mt-8 mb-4 scroll-m-20 text-3xl font-bold tracking-tight first:mt-0", className)} {...props} />
  ),
  h2: ({ className, ...props }: any) => (
    <h2 className={cn("mt-10 mb-4 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight first:mt-0", className)} {...props} />
  ),
  h3: ({ className, ...props }: any) => (
    <h3 className={cn("mt-8 mb-4 scroll-m-20 text-xl font-semibold tracking-tight", className)} {...props} />
  ),
  p: ({ className, ...props }: any) => (
    <p className={cn("leading-7 not-first:mt-6", className)} {...props} />
  ),
  ul: ({ className, ...props }: any) => (
    <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: any) => (
    <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
  ),
  li: ({ className, ...props }: any) => (
    <li className={cn("leading-7", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: any) => (
    <blockquote className={cn("mt-6 border-l-2 border-primary pl-6 italic text-muted-foreground", className)} {...props} />
  ),
  table: Table,
  th: Th,
  td: Td,
  pre: Pre,
  code: ({ className, children, ...props }: any) => {
    const isInline = !className?.includes("hljs");
    return (
      <code
        className={cn(
          isInline ? "relative rounded-xl bg-muted px-[0.3rem] py-[0.1rem] font-mono text-[0.85rem] font-medium" : "font-mono rounded-md text-sm",
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  a: ({ className, ...props }: any) => (
    <a className={cn("font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors", className)} {...props} />
  ),
  Callout: Callout,
  Badge: ({ className, ...props }: any) => (
    <span className={cn("inline-flex items-center rounded-none border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors", className)} {...props} />
  ),
  Card: ({ className, ...props }: any) => (
    <div className={cn("my-6 overflow-hidden border border-border bg-card text-card-foreground  shadow-sm", className)} {...props} />
  ),
};


const sanitizeOptions = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), "Callout", "Badge", "Card"],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] || []), "className", "style"],
    Callout: ["type"],
  },
};


type Props = {
  value: string;
};

export function MarkdownViewer({ value }: Props) {
  return (
    <Suspense
      fallback={
        <div className="h-32 w-full animate-pulse rounded-none bg-muted/30 border border-border" />
      }
    >
      <div className="w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeSanitize, sanitizeOptions],
            rehypeHighlight,
          ]}
          components={CustomComponents}
        >
          {value}
        </ReactMarkdown>
      </div>
    </Suspense>
  );
}
