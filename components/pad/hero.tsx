"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { hashCodeIdentifier } from "@/lib/crypto";

export function Hero() {
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  async function handleOpen() {
    if (!code.trim()) return;
    try {
      const padHash = await hashCodeIdentifier(code.trim());

      sessionStorage.setItem("pu-pad-code", code.trim());
      sessionStorage.setItem("pu-pad-hash", padHash);

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

  return (
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

      <Button
        className="w-full"
        onClick={handleOpen}
        disabled={isPending || !code.trim()}
      >
        {isPending ? "Opening..." : "Open pad"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        The server never sees your code or decrypted content. Lose the code,
        lose the pad.
      </p>
    </div>
  );
}

