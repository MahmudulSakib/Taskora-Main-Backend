CREATE TABLE "user_ranks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_ranks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_ranks" ADD CONSTRAINT "user_ranks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;