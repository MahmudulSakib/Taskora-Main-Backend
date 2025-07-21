ALTER TABLE "vendor_ship_requests" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_ship_requests" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_ship_requests" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_ship_requests" ADD CONSTRAINT "vendor_ship_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;