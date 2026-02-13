"use client";

import { useState } from "react";
import type { PadRecord, RevisionRecord } from "@/lib/types/pad";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";

type Props = {
  pad: PadRecord | null;
  revisions: RevisionRecord[];
  onRevisionsChange: (revs: RevisionRecord[]) => void;
  lineNumbers: boolean;
  onLineNumbersChange: (value: boolean) => void;
  lockCode: string | null;
  onLockCodeChange: (value: string | null) => void;
  onPadUpdate: (pad: PadRecord | null) => void;
};

export function SettingsMode({
  pad,
  revisions,
  onRevisionsChange,
  lineNumbers,
  onLineNumbersChange,
  lockCode,
  onLockCodeChange,
  onPadUpdate,
}: Props) {
  const [selfDestructEnabled, setSelfDestructEnabled] = useState(
    !!pad?.selfDestructAt
  );
  const [selfDestructDate, setSelfDestructDate] = useState<Date | undefined>(
    pad?.selfDestructAt ? new Date(pad.selfDestructAt) : undefined
  );
  const [selfDestructTime, setSelfDestructTime] = useState<string>(
    pad?.selfDestructAt
      ? new Date(pad.selfDestructAt).toISOString().slice(11, 16)
      : "12:00"
  );
  const { toast } = useToast();

  const handleSelfDestructSave = async () => {
    if (!pad) return;
    try {
      let nextDate: string | null = null;
      if (selfDestructEnabled && selfDestructDate) {
        const [hoursStr, minutesStr] = selfDestructTime.split(":");
        const hours = Number(hoursStr ?? "0");
        const minutes = Number(minutesStr ?? "0");
        const date = new Date(selfDestructDate);
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
          date.setHours(hours, minutes, 0, 0);
        }
        nextDate = date.toISOString();
      }

      const res = await fetch(`/api/pad/${pad.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selfDestructAt: nextDate,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update settings");
      }

      const data = await res.json();
      onPadUpdate({
        ...pad,
        selfDestructAt: data.selfDestructAt,
        updatedAt: data.updatedAt,
      });

      toast({
        title: "Updated",
        description: "Self destruct settings updated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update self destruct settings.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshRevisions = async () => {
    if (!pad) return;
    try {
      const res = await fetch(`/api/pad/${pad.id}/revisions`);
      if (!res.ok) return;
      const data: RevisionRecord[] = await res.json();
      onRevisionsChange(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!pad) return;
    try {
      const res = await fetch(`/api/pad/${pad.id}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          revisionId,
          expectedUpdatedAt: pad.updatedAt,
        }),
      });
      if (res.status === 409) {
        toast({
          title: "Conflict",
          description:
            "This pad was updated from another session. Please refresh.",
          variant: "destructive",
        });
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to restore revision");
      }
      const updated: PadRecord = await res.json();
      onPadUpdate(updated);
      toast({
        title: "Restored",
        description: "Revision restored.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to restore revision.",
        variant: "destructive",
      });
    }
  };

  const handleClearHistory = async () => {
    if (!pad) return;
    try {
      const res = await fetch(`/api/pad/${pad.id}/revisions`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("Failed to clear history");
      }
      onRevisionsChange([]);
      toast({
        title: "Cleared",
        description: "Revision history cleared.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to clear revision history.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-3 space-y-6">
      <FieldGroup>
        <Field orientation="responsive">
          <FieldLabel>Self destruct</FieldLabel>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Switch
                checked={selfDestructEnabled}
                onCheckedChange={(checked) => setSelfDestructEnabled(!!checked)}
              />
              <FieldDescription>
                Automatically delete this pad and all revisions at a specific
                time.
              </FieldDescription>
            </div>
            {selfDestructEnabled && (
              <div className="flex max-w-md flex-col gap-3">
                <Calendar
                  mode="single"
                  selected={selfDestructDate}
                  onSelect={setSelfDestructDate}
                  disabled={(date) => date < new Date()}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    className="w-28"
                    value={selfDestructTime}
                    onChange={(e) => setSelfDestructTime(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="self-start"
                    onClick={handleSelfDestructSave}
                    disabled={!pad || !selfDestructDate}
                  >
                    Save self destruct
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Field>

        <Field orientation="responsive">
          <FieldLabel>Pad lock</FieldLabel>
          <div className="flex flex-col gap-2">
            <FieldDescription>
              Optional second code that adds an extra encryption layer. Lose
              this lock code and you will not be able to decrypt the pad.
            </FieldDescription>
            <Input
              type="password"
              autoComplete="off"
              placeholder="Optional second code"
              value={lockCode ?? ""}
              onChange={(e) =>
                onLockCodeChange(e.target.value ? e.target.value : null)
              }
            />
          </div>
        </Field>

        <Field orientation="responsive">
          <FieldLabel>Line numbers</FieldLabel>
          <div className="flex items-center gap-3">
            <Switch
              checked={lineNumbers}
              onCheckedChange={(checked) => onLineNumbersChange(!!checked)}
            />
            <FieldDescription>
              Toggle line numbers in write mode.
            </FieldDescription>
          </div>
        </Field>

        <Field orientation="vertical">
          <FieldLabel>Revision history</FieldLabel>
          <div className="flex flex-col gap-2">
            <FieldDescription>
              Last 5 revisions are stored encrypted on the server. Restoring a
              revision replaces the current content.
            </FieldDescription>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefreshRevisions}
                disabled={!pad}
              >
                Refresh revisions
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearHistory}
                disabled={!pad || revisions.length === 0}
              >
                Clear history
              </Button>
            </div>
            <div className="mt-2 space-y-2 rounded-none border bg-muted/40 p-2">
              {revisions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No revisions saved yet.
                </p>
              )}
              {revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="flex items-center justify-between gap-2 rounded-none bg-background px-2 py-1 text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {new Date(rev.createdAt).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {rev.id.slice(0, 8)}…
                    </span>
                  </div>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handleRestoreRevision(rev.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Field>
      </FieldGroup>
    </div>
  );
}

