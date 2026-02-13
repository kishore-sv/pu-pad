CREATE TABLE "pads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pad_hash" text NOT NULL,
	"encrypted_content" text NOT NULL,
	"salt" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"word_count" integer DEFAULT 0 NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"self_destruct_at" timestamp with time zone DEFAULT null,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pads_pad_hash_unique" UNIQUE("pad_hash")
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pad_id" uuid NOT NULL,
	"encrypted_content" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_pad_id_pads_id_fk" FOREIGN KEY ("pad_id") REFERENCES "public"."pads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pads_pad_hash_idx" ON "pads" USING btree ("pad_hash");--> statement-breakpoint
CREATE INDEX "pads_self_destruct_at_idx" ON "pads" USING btree ("self_destruct_at");--> statement-breakpoint
CREATE INDEX "revisions_pad_id_idx" ON "revisions" USING btree ("pad_id");