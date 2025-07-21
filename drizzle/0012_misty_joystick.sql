ALTER TABLE "bonus_withdraw_requests" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bonus_withdraw_requests" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "method" text NOT NULL;--> statement-breakpoint
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "mobile_number" text;--> statement-breakpoint
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "account_number" text;--> statement-breakpoint
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "branch_name" text;--> statement-breakpoint
ALTER TABLE "bonus_withdraw_requests" ADD COLUMN "account_name" text;