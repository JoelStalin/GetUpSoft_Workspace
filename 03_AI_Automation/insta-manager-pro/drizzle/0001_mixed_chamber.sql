CREATE TABLE `approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`userId` int NOT NULL,
	`approved` int NOT NULL DEFAULT 0,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dailyProposalId` int NOT NULL,
	`googleDriveFileId` varchar(255) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`driveUrl` text NOT NULL,
	`thumbnailUrl` text,
	`caption` text NOT NULL,
	`hashtags` text,
	`analysisData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`),
	CONSTRAINT `photos_googleDriveFileId_unique` UNIQUE(`googleDriveFileId`)
);
--> statement-breakpoint
CREATE TABLE `published_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`instagramPostId` varchar(255) NOT NULL,
	`caption` text NOT NULL,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`lastMetricsUpdate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `published_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `published_posts_instagramPostId_unique` UNIQUE(`instagramPostId`)
);
--> statement-breakpoint
CREATE TABLE `schedule_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`proposalTime` varchar(5) NOT NULL DEFAULT '09:00',
	`publishingSlots` text NOT NULL,
	`maxDailyPublish` int NOT NULL DEFAULT 5,
	`maxDailyProposals` int NOT NULL DEFAULT 10,
	`timezone` varchar(50) NOT NULL DEFAULT 'America/Santo_Domingo',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedule_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `schedule_config_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photoId` int NOT NULL,
	`messageId` varchar(255),
	`status` enum('pending','sent','failed','delivered') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_notifications_id` PRIMARY KEY(`id`)
);
