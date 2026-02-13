import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const pads = pgTable(
  "pads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    padHash: text("pad_hash").notNull().unique(),
    encryptedContent: text("encrypted_content").notNull(),
    salt: text("salt").notNull(),
    iv: text("iv").notNull(),
    authTag: text("auth_tag").notNull(),
    wordCount: integer("word_count").notNull().default(0),
    isLocked: boolean("is_locked").notNull().default(false),
    selfDestructAt: timestamp("self_destruct_at", {
      withTimezone: true,
      mode: "date",
    }).default(null),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    padHashIdx: index("pads_pad_hash_idx").on(table.padHash),
    selfDestructIdx: index("pads_self_destruct_at_idx").on(table.selfDestructAt),
  })
);

export const revisions = pgTable(
  "revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    padId: uuid("pad_id")
      .notNull()
      .references(() => pads.id, { onDelete: "cascade" }),
    encryptedContent: text("encrypted_content").notNull(),
    iv: text("iv").notNull(),
    authTag: text("auth_tag").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    padIdIdx: index("revisions_pad_id_idx").on(table.padId),
  })
);

