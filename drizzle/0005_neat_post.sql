ALTER TABLE "user_bonus_wallet" ALTER COLUMN "amount" SET DATA TYPE numeric(10, 5);--> statement-breakpoint
ALTER TABLE "user_bonus_wallet" ALTER COLUMN "amount" SET DEFAULT '0.00000';