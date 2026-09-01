CREATE TABLE `memories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`date` text NOT NULL,
	`location` text,
	`media_key` text,
	`media_type` text,
	`created_at` integer NOT NULL
);
