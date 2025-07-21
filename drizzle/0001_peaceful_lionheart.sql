CREATE TABLE "drive_offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"is_sim_type" boolean DEFAULT false,
	"sim_type" varchar(50),
	"duration" varchar(100) NOT NULL,
	"validation" varchar(100) NOT NULL,
	"purchase_amount" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "recharges" RENAME TO "mobile_recharges";--> statement-breakpoint
ALTER TABLE "mobile_recharges" DROP CONSTRAINT "recharges_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "mobile_recharges" ADD CONSTRAINT "mobile_recharges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;