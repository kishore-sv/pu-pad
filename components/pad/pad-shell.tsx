"use client";

import { useCallback, useEffect, useState } from "react";
import type { PadRecord, RevisionRecord } from "@/lib/types/pad";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "use-debounce";
import { AUTO_SAVE_DEBOUNCE_MS, MAX_WORDS } from "@/lib/constants";
import {
  deriveAesKeyFromCode,
  decryptWithOptionalLock,
  encryptWithOptionalLock,
  generateSalt,
} from "@/lib/crypto";
import { useToast } from "@/components/ui/use-toast";
import { WriteMode } from "./write-mode";
import { ReadMode } from "./read-mode";
import { SettingsMode } from "./settings-mode";
import { ThemeToggle } from "../toggle-theme";


type Props = {
  initialPad: PadRecord | null;
  padHash: string;
  code: string;
  lockCode: string | null;
  onLockCodeChange: (value: string | null) => void;
};

type SavingState = "idle" | "saving" | "saved" | "error";

export function PadShell({
  initialPad,
  padHash,
  code,
  lockCode,
  onLockCodeChange,
}: Props) {
  const [activeTab, setActiveTab] = useState<"write" | "read" | "settings">(
    "write"
  );
  const [pad, setPad] = useState<PadRecord | null>(initialPad);
  const [content, setContent] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(initialPad?.wordCount ?? 0);
  const [savingState, setSavingState] = useState<SavingState>("idle");
  const [isInitializing, setIsInitializing] = useState(false);
  const [lineNumbers, setLineNumbers] = useState<boolean>(false);
  const [revisions, setRevisions] = useState<RevisionRecord[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    initialPad?.updatedAt ?? null
  );
  const { toast } = useToast();

  const countWords = useCallback((text: string): number => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, []);

  const loadOrCreatePad = useCallback(async () => {
    setIsInitializing(true);
    try {
      if (!pad) {
        const salt = generateSalt(16);
        const primaryKey = await deriveAesKeyFromCode(code, salt);
        const { payload, isLocked } = await encryptWithOptionalLock({
          plaintext: "",
          primaryKey,
        });

        const res = await fetch("/api/pad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            padHash,
            encryptedContent: payload.ciphertext,
            salt,
            iv: payload.iv,
            authTag: payload.authTag,
            wordCount: 0,
            isLocked,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to create pad");
        }

        const created: PadRecord = await res.json();
        setPad(created);
        setContent("");
        setWordCount(0);
        setLastSavedAt(created.updatedAt);
        toast({
          title: "Pad created",
          description: "Your encrypted pad is ready.",
        });
      } else {
        const primaryKey = await deriveAesKeyFromCode(code, pad.salt);
        const lk = pad.isLocked && lockCode ? lockCode : undefined;
        const lockKey =
          pad.isLocked && lk
            ? await deriveAesKeyFromCode(lk, pad.salt)
            : undefined;

        const text = await decryptWithOptionalLock({
          payload: {
            ciphertext: pad.encryptedContent,
            iv: pad.iv,
            authTag: pad.authTag,
          },
          primaryKey,
          isLocked: pad.isLocked,
          lockKey,
        });

        setContent(text);
        setWordCount(countWords(text));
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to initialize pad. Check your code(s).",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  }, [pad, padHash, code, lockCode, countWords, toast]);

  useEffect(() => {
    loadOrCreatePad();
  }, [loadOrCreatePad]);

  const debouncedSave = useDebouncedCallback(async (nextContent: string) => {
    await save(nextContent, { isAuto: true });
  }, AUTO_SAVE_DEBOUNCE_MS);

  const save = useCallback(
    async (
      nextContent: string,
      opts?: { isAuto?: boolean; closeAfter?: boolean }
    ) => {
      if (!pad) return;
      const words = countWords(nextContent);
      if (words > MAX_WORDS) {
        toast({
          title: "Word limit exceeded",
          description: `Maximum allowed words is ${MAX_WORDS.toLocaleString()}.`,
          variant: "destructive",
        });
        return;
      }

      setSavingState("saving");
      try {
        const primaryKey = await deriveAesKeyFromCode(code, pad.salt);
        const lk = pad.isLocked && lockCode ? lockCode : undefined;
        const lockKey =
          pad.isLocked && lk
            ? await deriveAesKeyFromCode(lk, pad.salt)
            : undefined;

        const { payload, isLocked } = await encryptWithOptionalLock({
          plaintext: nextContent,
          primaryKey,
          lockKey,
        });

        const res = await fetch("/api/pad", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            padId: pad.id,
            encryptedContent: payload.ciphertext,
            iv: payload.iv,
            authTag: payload.authTag,
            wordCount: words,
            isLocked,
            expectedUpdatedAt: pad.updatedAt,
            selfDestructAt: pad.selfDestructAt,
          }),
        });

        if (res.status === 409) {
          setSavingState("error");
          toast({
            title: "Conflict",
            description:
              "This pad was updated from another session. Please refresh.",
            variant: "destructive",
          });
          return;
        }

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "Save failed" }));
          throw new Error(errorData.error || "Save failed");
        }

        const updated: PadRecord = await res.json();
        setPad(updated);
        setWordCount(words);
        setLastSavedAt(updated.updatedAt);
        setSavingState("saved");

        if (!opts?.isAuto) {
          toast({
            title: "Saved",
            description: "Your encrypted pad has been saved.",
          });
        }

        if (opts?.closeAfter) {
          window.sessionStorage.removeItem("pu-pad-code");
          window.sessionStorage.removeItem("pu-pad-hash");
          window.location.href = "/";
        }
      } catch (error) {
        console.error(error);
        setSavingState("error");
        toast({
          title: "Error",
          description: "Failed to save pad.",
          variant: "destructive",
        });
      } finally {
        if (!opts?.isAuto) {
          setTimeout(() => setSavingState("idle"), 1000);
        }
      }
    },
    [pad, code, lockCode, countWords, toast]
  );

  useEffect(() => {
    async function loadRevisions() {
      if (!pad) return;
      try {
        const res = await fetch(`/api/pad/${pad.id}/revisions`, {
          method: "GET",
        });
        if (!res.ok) return;
        const data: RevisionRecord[] = await res.json();
        setRevisions(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadRevisions();
  }, [pad]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const key = e.key.toLowerCase();

      const cmd = isMac ? e.metaKey : e.ctrlKey;
      const alt = e.altKey;

      if (cmd && !alt && key === "s") {
        e.preventDefault();
        save(content, { isAuto: false });
      } else if (cmd && alt && key === "s") {
        e.preventDefault();
        save(content, { isAuto: false, closeAfter: true });
      } else if (!cmd && alt && (e.key === "F5" || (isMac && e.shiftKey && key === "r"))) {
        e.preventDefault();
        window.location.reload();
      } else if (e.key === "Escape") {
        e.preventDefault();
        window.location.href = "/";
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [content, save]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setWordCount(countWords(value));
    debouncedSave(value);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-6 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight">
              Encrypted Pad
            </h1>
            <p className="text-xs text-muted-foreground">
              Zero-knowledge encrypted notes. Your code is never sent to the server.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {wordCount.toLocaleString()} / {MAX_WORDS.toLocaleString()} words
            </Badge>
            {savingState === "saving" && (
              <Badge>Saving…</Badge>
            )}
            {savingState === "saved" && (
              <Badge variant="secondary">Saved</Badge>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1"
        >
          <TabsList>
            <TabsTrigger value="write" className="cursor-pointer">Write</TabsTrigger>
            <TabsTrigger value="read" className="cursor-pointer">Read</TabsTrigger>
            <TabsTrigger value="settings" className="cursor-pointer">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="h-full">
            <WriteMode
              value={content}
              onChange={handleContentChange}
              lineNumbers={lineNumbers}
              isInitializing={isInitializing}
            />
          </TabsContent>
          <TabsContent value="read" className="h-full">
            <ReadMode value={content} />
          </TabsContent>
          <TabsContent value="settings" className="h-full">
            <SettingsMode
              pad={pad}
              revisions={revisions}
              onRevisionsChange={setRevisions}
              lineNumbers={lineNumbers}
              onLineNumbersChange={setLineNumbers}
              lockCode={lockCode}
              onLockCodeChange={onLockCodeChange}
              onPadUpdate={setPad}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-background/95 fixed inset-x-0 bottom-0 border-t">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-2">
          <div className="flex flex-col md:flex-row items-center gap-2 text-[11px] text-muted-foreground">
            {lastSavedAt && (
              <span>
                Last saved at{" "}
                {new Date(lastSavedAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            )}
            <ThemeToggle />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="cursor-pointer"
              variant="outline"
              disabled={savingState === "saving" || !pad}
              onClick={() => {
                save(content, { isAuto: false, closeAfter: true });
              }}
            >
              Save &amp; Close
              <span className="ml-2 text-[10px] text-muted-foreground">
                ⌘⌥S / Ctrl+Alt+S
              </span>
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              disabled={savingState === "saving" || !pad}
              onClick={() => save(content, { isAuto: false })}
            >
              Save
              <span className="ml-2 text-[10px] text-muted">
                ⌘S / Ctrl+S
              </span>
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              variant="ghost"
              disabled={savingState === "saving"}
              onClick={() => window.location.reload()}
            >
              Refresh
              <span className="ml-2 text-[10px] text-muted-foreground">
                ⌥⇧R / Alt+F5
              </span>
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              variant="ghost"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Close
              <span className="ml-2 text-[10px] text-muted-foreground">
                Esc
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

