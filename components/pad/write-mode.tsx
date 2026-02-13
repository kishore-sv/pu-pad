"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: string;
  onChange: (value: string) => void;
  lineNumbers: boolean;
  isInitializing: boolean;
}

export function WriteMode({
  value,
  onChange,
  lineNumbers,
  isInitializing,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumberRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    const lineNumbersEl = lineNumberRef.current;

    if (!textarea || !lineNumbersEl) return;

    const syncScroll = () => {
      lineNumbersEl.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener("scroll", syncScroll);
    return () => {
      textarea.removeEventListener("scroll", syncScroll);
    };
  }, []);

  if (isInitializing) {
    return (
      <div className="mt-4 h-64 w-full animate-pulse bg-muted" />
    );
  }

  const lines = value.split("\n");

  return (
    <div className="mt-2 h-full">
      <div className="flex h-[60vh] max-h-[calc(100vh-12rem)] overflow-hidden border">
        {lineNumbers && (
          <div
            ref={lineNumberRef}
            className="w-12 overflow-hidden border-r bg-muted/40 px-2 py-2 text-right font-mono text-xs leading-5 text-muted-foreground"
          >
            {lines.map((_, i) => (
              <div key={i} className="h-[20px]">
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <Textarea
          ref={textareaRef}
          className="h-full w-full resize-none overflow-y-scroll font-mono leading-5"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
