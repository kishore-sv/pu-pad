"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PadRecord } from "@/lib/types/pad";
import { PadShell } from "@/components/pad/pad-shell";
import { useToast } from "@/components/ui/use-toast";

export default function PadPage() {
  const [pad, setPad] = useState<PadRecord | null>(null);
  const [padHash, setPadHash] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [lockCode, setLockCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const storedCode = sessionStorage.getItem("pu-pad-code");
    const storedHash = sessionStorage.getItem("pu-pad-hash");
    const storedLockCode = sessionStorage.getItem("pu-pad-lock-code");

    if (!storedCode || !storedHash) {
      toast({
        title: "Code required",
        description: "Please enter your code on the home page.",
        variant: "destructive",
      });
      router.replace("/");
      return;
    }

    setCode(storedCode);
    setPadHash(storedHash);
    setLockCode(storedLockCode);

    async function loadPad() {
      setStatus("loading");
      try {
        const res = await fetch("/api/pad/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ padHash: storedHash }),
        });

        if (!res.ok) {
          throw new Error("Lookup failed");
        }

        const data = await res.json();

        if (data.status === "not_found") {
          setPad(null);
        } else if (data.status === "expired") {
          toast({
            title: "Pad expired",
            description:
              "This pad has self-destructed and can no longer be accessed.",
            variant: "destructive",
          });
          sessionStorage.removeItem("pu-pad-code");
          sessionStorage.removeItem("pu-pad-hash");
          router.replace("/");
          return;
        } else if (data.status === "found") {
          setPad(data.pad);
        }

        setStatus("idle");
      } catch (error) {
        console.error(error);
        setStatus("error");
        toast({
          title: "Error",
          description: "Failed to load pad.",
          variant: "destructive",
        });
      }
    }

    loadPad();
  }, [router, toast]);

  if (!code || !padHash || status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="h-32 w-full max-w-2xl animate-pulse rounded-none bg-muted" />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Something went wrong loading your pad.
          </p>
          <button
            className="text-sm underline cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <PadShell
        initialPad={pad}
        padHash={padHash}
        code={code}
        lockCode={lockCode}
        onLockCodeChange={setLockCode}
      />
    </main>
  );
}

