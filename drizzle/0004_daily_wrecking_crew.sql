CREATE TABLE "user_bonus_wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric DEFAULT '0',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_post_requests" ADD COLUMN "left_limit" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "job_proofs" ADD COLUMN "status" varchar(20) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "user_bonus_wallet" ADD CONSTRAINT "user_bonus_wallet_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;