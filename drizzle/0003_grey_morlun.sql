CREATE TABLE "job_proofs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"image_urls" text[] NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_proofs" ADD CONSTRAINT "job_proofs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_proofs" ADD CONSTRAINT "job_proofs_job_id_job_post_requests_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_post_requests"("id") ON DELETE cascade ON UPDATE no action;