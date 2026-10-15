CREATE TABLE `attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`question_id` text NOT NULL,
	`correct` integer NOT NULL,
	`answered_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_id` text NOT NULL,
	`title` text NOT NULL,
	`map_node_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`energy_cost_to_unlock` integer DEFAULT 1 NOT NULL,
	`difficulty` text DEFAULT 'easy' NOT NULL,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `map_nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`realm` text DEFAULT 'meadow' NOT NULL,
	`label` text NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`unlock_order` integer DEFAULT 0 NOT NULL,
	`lesson_id` text,
	`energy_cost_to_enter` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `map_pickups` (
	`id` text PRIMARY KEY NOT NULL,
	`node_id` text NOT NULL,
	`coin_amount` integer DEFAULT 5 NOT NULL,
	`kind` text DEFAULT 'chest' NOT NULL,
	FOREIGN KEY (`node_id`) REFERENCES `map_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile_node_unlocks` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`node_id` text NOT NULL,
	`unlocked_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`node_id`) REFERENCES `map_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unlock_profile_node` ON `profile_node_unlocks` (`profile_id`,`node_id`);--> statement-breakpoint
CREATE TABLE `profile_pickup_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`pickup_id` text NOT NULL,
	`claimed_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pickup_id`) REFERENCES `map_pickups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `claim_profile_pickup` ON `profile_pickup_claims` (`profile_id`,`pickup_id`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_key` text DEFAULT 'explorer' NOT NULL,
	`age_band` text NOT NULL,
	`energy` integer DEFAULT 0 NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`streak` integer DEFAULT 0 NOT NULL,
	`map_node_id` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`prompt` text NOT NULL,
	`type` text DEFAULT 'mcq' NOT NULL,
	`choices_json` text NOT NULL,
	`correct_index` integer NOT NULL,
	`explanation` text,
	`difficulty` text DEFAULT 'easy' NOT NULL,
	`media_url` text,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `review_items` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`question_id` text NOT NULL,
	`wrong_count` integer DEFAULT 1 NOT NULL,
	`mastered_at` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_profile_question` ON `review_items` (`profile_id`,`question_id`);--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text DEFAULT 'book' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subjects_slug_unique` ON `subjects` (`slug`);