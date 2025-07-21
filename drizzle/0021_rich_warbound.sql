ALTER TABLE "users" ALTER COLUMN "refer_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referred_by" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "referral_bonus_granted" boolean DEFAULT false NOT NULL;