CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`id_token` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `family` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`invite_code` text NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `family_invite_code_unique` ON `family` (`invite_code`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`gender` text,
	`birthday` text,
	`locale` text DEFAULT 'th' NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`family_id` text,
	`family_role` text,
	`avatar_config` text,
	`profile_picture` text,
	`total_xp` integer DEFAULT 0 NOT NULL,
	`brave_coins` integer DEFAULT 0 NOT NULL,
	`quests_completed` integer DEFAULT 0 NOT NULL,
	`show_on_leaderboard` integer DEFAULT true NOT NULL,
	`streak_current` integer DEFAULT 0 NOT NULL,
	`streak_longest` integer DEFAULT 0 NOT NULL,
	`streak_last_visit` text,
	`sound_enabled` integer DEFAULT true NOT NULL,
	`music_enabled` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`family_id`) REFERENCES `family`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_username_unique` ON `user_profile` (`username`);--> statement-breakpoint
CREATE INDEX `idx_profile_xp` ON `user_profile` (`total_xp`);--> statement-breakpoint
CREATE INDEX `idx_profile_family` ON `user_profile` (`family_id`);--> statement-breakpoint
CREATE TABLE `quest` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`photo_r2_key` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`xp_awarded` integer DEFAULT 0 NOT NULL,
	`coins_awarded` integer DEFAULT 0 NOT NULL,
	`ai_justification` text,
	`source` text DEFAULT 'submission' NOT NULL,
	`chore_instance_id` text,
	`submitted_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`approved_at` integer,
	`approved_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approved_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_quest_user_status` ON `quest` (`user_id`,`status`);--> statement-breakpoint
CREATE INDEX `idx_quest_status_submitted` ON `quest` (`status`,`submitted_at`);--> statement-breakpoint
CREATE TABLE `chore_instance` (
	`id` text PRIMARY KEY NOT NULL,
	`recurring_chore_id` text NOT NULL,
	`user_id` text NOT NULL,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`completed_quest_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`recurring_chore_id`) REFERENCES `recurring_chore`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`completed_quest_id`) REFERENCES `quest`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_chore_instance_per_day` ON `chore_instance` (`recurring_chore_id`,`user_id`,`due_date`);--> statement-breakpoint
CREATE TABLE `recurring_chore` (
	`id` text PRIMARY KEY NOT NULL,
	`family_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`frequency` text NOT NULL,
	`days_of_week` text,
	`assigned_user_id` text,
	`default_xp` integer DEFAULT 25 NOT NULL,
	`default_coins` integer DEFAULT 3 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`family_id`) REFERENCES `family`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `redeemed_reward` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`reward_id` text NOT NULL,
	`cost_at_time` integer NOT NULL,
	`status` text DEFAULT 'processing' NOT NULL,
	`redeemed_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`shipped_at` integer,
	`delivered_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reward_id`) REFERENCES `reward`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reward` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_en` text,
	`description` text NOT NULL,
	`description_en` text,
	`cost` integer NOT NULL,
	`image_url` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `achievement` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_en` text,
	`description` text NOT NULL,
	`description_en` text,
	`icon` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_achievement` (
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	PRIMARY KEY(`user_id`, `achievement_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievement`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notification` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`type` text NOT NULL,
	`link` text,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notif_user_unread` ON `notification` (`user_id`,`is_read`,`created_at`);--> statement-breakpoint
CREATE TABLE `daily_streak_log` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`xp_awarded` integer DEFAULT 0 NOT NULL,
	`source` text DEFAULT 'login' NOT NULL,
	PRIMARY KEY(`user_id`, `date`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `mini_game_attempt` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`game` text NOT NULL,
	`date` text NOT NULL,
	`payload` text,
	`xp_awarded` integer DEFAULT 0 NOT NULL,
	`coins_awarded` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_mini_game_per_day` ON `mini_game_attempt` (`user_id`,`game`,`date`);--> statement-breakpoint
CREATE TABLE `trivia_question` (
	`id` text PRIMARY KEY NOT NULL,
	`locale` text NOT NULL,
	`date_pool` text,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`correct_index` integer NOT NULL,
	`explanation` text,
	`difficulty` text,
	`topic` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_trivia_pool` ON `trivia_question` (`locale`,`date_pool`);