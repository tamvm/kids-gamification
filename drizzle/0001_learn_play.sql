CREATE TABLE `learn_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`profile_id` text NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `learn_courses`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learn_assign_course_profile` ON `learn_assignments` (`course_id`,`profile_id`);--> statement-breakpoint
CREATE TABLE `learn_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`blurb` text DEFAULT '' NOT NULL,
	`subject_name` text NOT NULL,
	`year_level` text,
	`ac_codes_json` text DEFAULT '[]' NOT NULL,
	`kind` text NOT NULL,
	`builtin_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learn_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`round_id` text,
	`course_id` text,
	`stars` integer NOT NULL,
	`minutes` integer NOT NULL,
	`minutes_spent` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`local_date` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`round_id`) REFERENCES `learn_rounds`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`course_id`) REFERENCES `learn_courses`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `learn_ledger` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`kind` text NOT NULL,
	`stars` integer DEFAULT 0 NOT NULL,
	`minutes` integer DEFAULT 0 NOT NULL,
	`round_id` text,
	`grant_id` text,
	`local_date` text NOT NULL,
	`note` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `learn_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `learn_courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `learn_play_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`minutes` integer NOT NULL,
	`local_date` text NOT NULL,
	`started_at` text NOT NULL,
	`ends_at` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `learn_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`prompt` text NOT NULL,
	`type` text NOT NULL,
	`choices_json` text,
	`correct_index` integer,
	`answers_json` text,
	`explanation` text,
	`hint` text,
	`ac_codes_json` text DEFAULT '[]' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `learn_lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `learn_round_items` (
	`id` text PRIMARY KEY NOT NULL,
	`round_id` text NOT NULL,
	`position` integer NOT NULL,
	`kind` text NOT NULL,
	`public_json` text NOT NULL,
	`secret_json` text NOT NULL,
	`tries` integer DEFAULT 0 NOT NULL,
	`first_try_correct` integer,
	`revealed` integer DEFAULT false NOT NULL,
	`resolved` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`round_id`) REFERENCES `learn_rounds`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `learn_rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`course_id` text NOT NULL,
	`local_date` text NOT NULL,
	`mode` text NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`scored` integer DEFAULT false NOT NULL,
	`first_try_correct` integer DEFAULT 0 NOT NULL,
	`question_count` integer DEFAULT 10 NOT NULL,
	`started_at` text DEFAULT (datetime('now')) NOT NULL,
	`finished_at` text,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`course_id`) REFERENCES `learn_courses`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `parents` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `pin_hash` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `year_level` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `daily_cap_minutes` integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `learn_portal` integer DEFAULT false NOT NULL;