CREATE TABLE `tenant_settings` (
	`tenant_id` text PRIMARY KEY NOT NULL,
	`app_name` text,
	`app_short_name` text,
	`logo_url` text,
	`mascot_url` text,
	`theme` text,
	`currency_name` text,
	`currency_short` text,
	`xp_name` text,
	`level_titles` text,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
-- Seed the single-tenant deployment's row so first paint uses defaults.
INSERT OR IGNORE INTO `tenant_settings` (`tenant_id`) VALUES ('default');
