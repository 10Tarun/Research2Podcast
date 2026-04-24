CREATE TABLE `conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paperId` int NOT NULL,
	`userId` int NOT NULL,
	`rawText` text,
	`script` text,
	`selectedVoice` varchar(64),
	`audioUrl` varchar(512),
	`status` enum('uploaded','parsing','scripting','synthesizing','completed','failed') NOT NULL DEFAULT 'uploaded',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `papers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `papers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `voices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`voiceId` varchar(64) NOT NULL,
	`voiceName` varchar(255) NOT NULL,
	`gender` varchar(32),
	`accent` varchar(64),
	`description` text,
	CONSTRAINT `voices_id` PRIMARY KEY(`id`),
	CONSTRAINT `voices_voiceId_unique` UNIQUE(`voiceId`)
);
