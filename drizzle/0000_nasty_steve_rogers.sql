CREATE TABLE `plan_assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_plan_id` integer NOT NULL,
	`can_run_2k_nonstop` integer,
	`can_run_5k_nonstop` integer,
	`can_run_5k_under_30` integer,
	`can_run_10k_nonstop` integer,
	`recent_weekly_mileage` integer,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_assessments_user_plan_id_unique` ON `plan_assessments` (`user_plan_id`);--> statement-breakpoint
CREATE TABLE `training_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`distance_type` text NOT NULL,
	`duration_weeks` integer NOT NULL,
	`difficulty` text DEFAULT 'beginner' NOT NULL,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `user_plans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` integer NOT NULL,
	`start_date` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`fitness_level` text DEFAULT 'beginner',
	`training_days_per_week` integer DEFAULT 3,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`birth_year` integer,
	`gender` text,
	`weight_kg` real,
	`height_cm` real,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profiles_user_id_unique` ON `user_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `workout_completions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_plan_id` integer NOT NULL,
	`workout_id` integer NOT NULL,
	`completed_date` integer DEFAULT (unixepoch()),
	`effort_feedback` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`plan_id` integer NOT NULL,
	`week_number` integer NOT NULL,
	`day_number` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`workout_type` text DEFAULT 'easy' NOT NULL,
	`distance_km` real,
	`duration_minutes` integer,
	`instructions` text,
	`created_at` integer DEFAULT (unixepoch())
);
