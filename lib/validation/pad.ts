import { z } from "zod";
import { MAX_CONTENT_BYTES, MAX_WORDS } from "@/lib/constants";

export const padHashSchema = z
  .string()
  .min(64)
  .max(64)
  .regex(/^[0-9a-f]+$/);

export const openPadRequestSchema = z.object({
  padHash: padHashSchema,
});

export const createPadRequestSchema = z.object({
  padHash: padHashSchema,
  // Allow empty string for brand new pads (encrypted empty content is still non-sensitive).
  encryptedContent: z.string().min(0).max(MAX_CONTENT_BYTES),
  salt: z.string().min(1),
  iv: z.string().min(1),
  authTag: z.string().min(1),
  wordCount: z.number().int().min(0).max(MAX_WORDS),
  isLocked: z.boolean().default(false),
});

export const updatePadRequestSchema = z.object({
  padId: z.string().uuid(),
  encryptedContent: z.string().min(1).max(MAX_CONTENT_BYTES),
  iv: z.string().min(1),
  authTag: z.string().min(1),
  wordCount: z.number().int().min(0).max(MAX_WORDS),
  isLocked: z.boolean(),
  expectedUpdatedAt: z.string().datetime(),
  selfDestructAt: z.string().datetime().nullable().optional(),
});

export const settingsUpdateSchema = z.object({
  padId: z.string().uuid(),
  selfDestructAt: z.string().datetime().nullable(),
});

export const listRevisionsSchema = z.object({
  padId: z.string().uuid(),
});

export const restoreRevisionSchema = z.object({
  padId: z.string().uuid(),
  revisionId: z.string().uuid(),
  expectedUpdatedAt: z.string().datetime(),
});

export const clearRevisionsSchema = z.object({
  padId: z.string().uuid(),
});

export type OpenPadRequest = z.infer<typeof openPadRequestSchema>;
export type CreatePadRequest = z.infer<typeof createPadRequestSchema>;
export type UpdatePadRequest = z.infer<typeof updatePadRequestSchema>;
export type SettingsUpdateRequest = z.infer<typeof settingsUpdateSchema>;
export type RestoreRevisionRequest = z.infer<typeof restoreRevisionSchema>;

