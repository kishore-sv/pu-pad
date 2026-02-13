"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconHome, IconSearch } from "@tabler/icons-react";

export default function NotFound() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleSearch() {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>404 – Page not found</EmptyTitle>
          <EmptyDescription>
            The page you’re looking for doesn’t exist.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="space-y-4">
          <InputGroup className="sm:w-3/4 mx-auto">
            <InputGroupInput
              ref={inputRef}
              value={query}
              placeholder="Search pages..."
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <InputGroupAddon onClick={handleSearch} className="cursor-pointer">
              <IconSearch className="size-4 opacity-60" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Kbd>/</Kbd>
            </InputGroupAddon>
          </InputGroup>

          <div className="flex justify-center gap-2">
            <Link href="/">
              <Button size="sm" className="gap-2 cursor-pointer" >
                <IconHome className="size-4" />
                Go home
              </Button>
            </Link>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}