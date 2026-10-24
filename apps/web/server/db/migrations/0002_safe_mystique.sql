CREATE TABLE "garden_mood" (
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"mood" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "garden_mood_user_id_date_mood_pk" PRIMARY KEY("user_id","date","mood")
);
--> statement-breakpoint
CREATE TABLE "garden_plant" (
	"user_id" text NOT NULL,
	"date" date NOT NULL,
	"icon" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "garden_plant_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
ALTER TABLE "garden_mood" ADD CONSTRAINT "garden_mood_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garden_plant" ADD CONSTRAINT "garden_plant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;