CREATE TABLE "user_ai_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"email" text NOT NULL,
	"mobile_number" text NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_ai_subscriptions" ADD CONSTRAINT "user_ai_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_ai_subscriptions" ADD CONSTRAINT "user_ai_subscriptions_plan_id_ai_subscriptions_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."ai_subscriptions"("id") ON DELETE no action ON UPDATE no action;