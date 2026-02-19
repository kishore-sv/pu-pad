"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { hashCodeIdentifier } from "@/lib/crypto";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const [customTheme, setCustomTheme] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [secondCode, setSecondCode] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  async function handleOpen() {
    if (!code.trim()) return;
    try {
      const padHash = await hashCodeIdentifier(code.trim());

      // Check if pad exists and is locked
      const res = await fetch("/api/pad/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ padHash }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "found" && data.pad.isLocked && !secondCode) {
          setIsLocked(true);
          toast({
            title: "Pad Locked",
            description: "This pad requires a second code to open.",
          });
          return;
        }
      }

      sessionStorage.setItem("pu-pad-code", code.trim());
      sessionStorage.setItem("pu-pad-hash", padHash);
      if (secondCode) {
        sessionStorage.setItem("pu-pad-lock-code", secondCode);
      } else {
        sessionStorage.removeItem("pu-pad-lock-code");
      }

      startTransition(() => {
        router.push("/pad");
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to derive pad key.",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    const storedTheme = localStorage.getItem("customTheme");
    if (storedTheme !== null) {
      setCustomTheme(storedTheme === "true");
    }
  }, []);
  const handleCustomThemeChange = () => {
    setCustomTheme((prev) => {
      const updated = !prev;
      localStorage.setItem("customTheme", String(updated));
      return updated;
    });
  };

  return !customTheme ? (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Encrypted Code Pad
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter a code to open or create a private, encrypted pad. No account,
          no signup.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Enter new or existing code</Label>
        <Input
          id="code"
          autoComplete="off"
          type="password"
          placeholder="Your secret code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleOpen();
            }
          }}
        />
      </div>

      {isLocked && (
        <div className="space-y-2">
          <Label htmlFor="secondCode">Enter second code (Pad Locked)</Label>
          <Input
            id="secondCode"
            autoComplete="off"
            type="password"
            placeholder="Your second code"
            value={secondCode}
            onChange={(e) => setSecondCode(e.target.value)}
            disabled={isPending}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleOpen();
              }
            }}
          />
        </div>
      )}

      <Button
        className="w-full cursor-pointer"
        onClick={handleOpen}
        disabled={isPending || !code.trim() || (isLocked && !secondCode.trim())}
      >
        {isPending ? "Opening..." : isLocked ? "Unlock & Open" : "Open pad"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        The server never sees your code or decrypted content. Lose the code,
        lose the pad.
      </p>

      <div className="absolute right-0 bottom-0 px-4 md:px-8">
        <Button
          onClick={handleCustomThemeChange}
          className="cursor-pointer rounded-md px-4 font-bold hover:italic transition-all ease-in-out"
          size="lg"
          variant="ghost"
        >
          D
        </Button>
      </div>
      <Button variant="link" className="absolute cursor-pointer left-0 bottom-0">
        <Link href="/about">About</Link>
      </Button>
    </div>
  ) : (
    <div
      className="w-full h-screen fixed flex flex-col-reverse md:flex-row bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bg.webp')" }}
    >
      <section className="flex items-center px-10 relative">
        <img src="/notes.png" alt="notes" draggable={false} className="select-none" />
        <h1 className="text-6xl font-bold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-black">P <br />U <br /> Pad</h1>
      </section>
      <section className="flex items-center justify-center md:text-secondary">
        <div className="rounded-lg md:ml-20 bg-black/20 backdrop-blur-md p-6 md:p-10 flex flex-col gap-5">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Encrypted Code Pad
            </h1>
            <p className="text-sm text-muted-foreground md:text-muted">
              Enter a code to open or create a private, encrypted pad. No account,
              no signup.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Enter new or existing code</Label>
            <Input
              id="code"
              autoComplete="off"
              type="password"
              placeholder="Your secret code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleOpen();
                }
              }}
            />
          </div>

          {isLocked && (
            <div className="space-y-2">
              <Label htmlFor="secondCode">Enter second code (Pad Locked)</Label>
              <Input
                id="secondCode"
                autoComplete="off"
                type="password"
                placeholder="Your second code"
                value={secondCode}
                onChange={(e) => setSecondCode(e.target.value)}
                disabled={isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleOpen();
                  }
                }}
              />
            </div>
          )}

          <Button
            className="w-full cursor-pointer"
            onClick={handleOpen}
            disabled={isPending || !code.trim() || (isLocked && !secondCode.trim())}
          >
            {isPending ? "Opening..." : isLocked ? "Unlock & Open" : "Open pad"}
          </Button>

          <p className="text-xs text-muted/50 dark:text-muted text-center">
            The server never sees your code or decrypted content. Lose the code,
            lose the pad.
          </p>
        </div>
      </section>
      <div className="absolute right-0 bottom-0 px-4 md:px-8">
        <Button
          onClick={handleCustomThemeChange}
          className={cn("cursor-pointer rounded-md px-4 font-bold hover:italic transition-all ease-in-out", customTheme ? "text-white" : "text-black")}
          size="lg"
          variant="ghost"
        >
          D
        </Button>
      </div>
      <Button variant="link" className="absolute text-black cursor-pointer left-2 bottom-0 z-50">
        <Link href="/about">About</Link>
      </Button>
    </div>
  );


}

