-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 03, 2026 at 02:16 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wastesense_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `feedback_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`feedback_id`, `user_id`, `message`, `created_at`) VALUES
(1, 6, 'Test feedback message after migration', '2026-03-03 00:55:45');

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `location_id` int(11) NOT NULL,
  `barangay_name` varchar(100) NOT NULL,
  `municipality` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `zone_or_street` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`location_id`, `barangay_name`, `municipality`, `province`, `zone_or_street`, `created_at`) VALUES
(1, 'Barangay Poblacion', 'Sample Municipality', 'Sample Province', 'Zone 1', '2026-02-24 12:00:30'),
(2, 'Barangay San Jose', 'Sample Municipality', 'Sample Province', 'Zone 2', '2026-02-24 12:00:30'),
(3, 'Barangay Santa Maria', 'Sample Municipality', 'Sample Province', 'Zone 3', '2026-02-24 12:00:30');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `notification_type` enum('reminder','schedule_change','system') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_requests`
--

CREATE TABLE `password_reset_requests` (
  `request_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `request_type` enum('change_password') NOT NULL,
  `description` text NOT NULL,
  `status` enum('pending','accepted','denied','completed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_reset_requests`
--

INSERT INTO `password_reset_requests` (`request_id`, `user_id`, `email`, `request_type`, `description`, `status`, `created_at`, `updated_at`, `resolved_at`) VALUES
(1, 2, 'robertdan@gmail.com', 'change_password', 'as', 'pending', '2026-02-24 14:27:30', '2026-02-24 14:27:30', NULL),
(2, 2, 'robertdan@gmail.com', 'change_password', 'as', 'pending', '2026-02-24 14:27:32', '2026-02-24 14:27:32', NULL),
(3, 2, 'robertdan@gmail.com', 'change_password', 'as', 'pending', '2026-02-24 14:27:33', '2026-02-24 14:27:33', NULL),
(4, 3, 'daniel@gmail.com', 'change_password', '', 'pending', '2026-02-24 14:29:57', '2026-02-24 14:29:57', NULL),
(5, 3, 'daniel@gmail.com', 'change_password', '', 'pending', '2026-02-24 14:31:53', '2026-02-24 14:31:53', NULL),
(6, 3, 'daniel@gmail.com', 'change_password', 'i forgot my password', 'accepted', '2026-02-24 14:43:43', '2026-02-24 14:44:26', '2026-02-24 14:44:26');

-- --------------------------------------------------------

--
-- Table structure for table `performance_tracking`
--

CREATE TABLE `performance_tracking` (
  `tracking_id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `collector_id` int(11) DEFAULT NULL,
  `planned_date` date NOT NULL,
  `actual_date` date DEFAULT NULL,
  `status` enum('completed','missed','delayed') NOT NULL DEFAULT 'missed',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `schedule_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `collection_day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  `collection_time` time NOT NULL,
  `waste_category_id` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `location_id`, `collection_day`, `collection_time`, `waste_category_id`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Monday', '08:00:00', 1, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(2, 1, 'Wednesday', '08:00:00', 2, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(3, 1, 'Friday', '08:00:00', 3, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(4, 2, 'Tuesday', '09:00:00', 1, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(5, 2, 'Thursday', '09:00:00', 2, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(6, 3, 'Monday', '10:00:00', 4, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(7, 3, 'Thursday', '10:00:00', 4, 1, 1, '2026-02-24 12:00:30', '2026-02-24 15:42:59'),
(8, 1, 'Tuesday', '11:37:00', 1, 1, 1, '2026-02-24 15:43:39', '2026-02-24 15:43:39'),
(9, 2, 'Tuesday', '11:45:00', 6, 1, 1, '2026-02-24 15:45:28', '2026-02-24 15:45:28'),
(10, 2, 'Monday', '11:45:00', 6, 1, 1, '2026-02-24 15:45:28', '2026-02-24 15:45:28'),
(11, 2, 'Monday', '04:50:00', 3, 1, 1, '2026-02-24 15:46:41', '2026-02-24 15:46:41'),
(12, 2, 'Thursday', '04:50:00', 3, 1, 1, '2026-02-24 15:46:41', '2026-02-24 15:46:41'),
(13, 2, 'Friday', '04:50:00', 3, 1, 1, '2026-02-24 15:46:41', '2026-02-24 15:46:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` enum('resident','collector','admin') NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `full_name`, `role`, `phone_number`, `address`, `barangay_id`, `profile_picture`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@wastesense.ph', '$2b$10$3l6Xmd0p2UmBCG6CPwY3fuAi0mxHkrR3AKtYDZgr.2z07EGMkvwH6', 'System Administrator', 'admin', '09123456789', 'Admin Office', NULL, NULL, 1, '2026-02-24 12:00:30', '2026-02-24 12:00:30'),
(2, 'robertdan@gmail.com', '$2b$10$Ck4m6I1xsiNBCiSqVVh6p.l2ZfhpJJgKvbrXjEVx6lSU.p8ZQBIh2', 'Robert Dan', 'resident', NULL, NULL, 3, NULL, 1, '2026-02-24 13:31:56', '2026-02-24 13:31:56'),
(3, 'daniel@gmail.com', '$2b$10$pbhSf8yB1lCJm2N4TbYBPe.bt4rlLt3sz8Th86yH4vS/hm8XhsyCK', 'daniel', 'resident', NULL, NULL, 1, NULL, 1, '2026-02-24 14:29:44', '2026-02-24 14:29:44'),
(4, 'pat@gmail.com', '$2b$10$EIY9PlrEXXDTGG6dqFe0FeRvKyExeBDDI/TxgDCDpEj40vColQ/sy', 'Patrick', 'resident', NULL, NULL, 3, NULL, 1, '2026-02-24 14:35:27', '2026-02-24 14:35:27'),
(5, 'collector1@wastesense.ph', '$2b$10$HMA9kqux1zC5Dp63FUqN4eV9H8IENCmyFWkLK2x9iZlY4TVlyL236', 'collector1', 'collector', NULL, NULL, NULL, NULL, 1, '2026-02-24 15:04:28', '2026-02-24 15:05:02'),
(6, 'resident1@wastesense.ph', '$2b$10$nbOOw7Z1Reo53PVATdLSQ.LZleR62z8g5KJ4DxMJgejfLWxj84BW.', 'Resident One', 'resident', NULL, NULL, NULL, NULL, 1, '2026-03-03 00:53:04', '2026-03-03 00:53:04');

-- --------------------------------------------------------

--
-- Table structure for table `waste_categories`
--

CREATE TABLE `waste_categories` (
  `category_id` int(11) NOT NULL,
  `category_key` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste_categories`
--

INSERT INTO `waste_categories` (`category_id`, `category_key`, `display_name`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'biodegradable', 'Biodegradable', 'natural waste', 1, 1, '2026-02-24 15:36:34', '2026-02-24 15:36:34'),
(2, 'non-biodegradable', 'Non-Biodegradable', 'Residual waste that is not compostable', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(3, 'recyclable', 'Recyclable', 'Recyclable materials like plastic, glass, paper, metal', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(4, 'mixed', 'Mixed', 'Mixed or unknown waste type', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(5, 'special', 'Special Waste', 'Special handling (e-waste, medical, etc.)', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59'),
(6, 'hazardous', 'Hazardous', 'Hazardous/toxic materials', 1, 1, '2026-02-24 15:42:59', '2026-02-24 15:42:59');

-- --------------------------------------------------------

--
-- Table structure for table `waste_submissions`
--

CREATE TABLE `waste_submissions` (
  `submission_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `collector_id` int(11) DEFAULT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `predicted_category` varchar(50) DEFAULT NULL,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `confirmed_category` enum('biodegradable','non-biodegradable','recyclable','special','hazardous','mixed') DEFAULT NULL,
  `waste_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`waste_types`)),
  `waste_adjective` varchar(50) DEFAULT NULL,
  `waste_adjectives` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`waste_adjectives`)),
  `waste_description` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `address_description` text DEFAULT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `collection_status` enum('pending','scheduled','collected') NOT NULL DEFAULT 'pending',
  `scheduled_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `collected_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste_submissions`
--

INSERT INTO `waste_submissions` (`submission_id`, `user_id`, `collector_id`, `image_path`, `predicted_category`, `confidence_score`, `confirmed_category`, `waste_types`, `waste_adjective`, `waste_adjectives`, `waste_description`, `latitude`, `longitude`, `address_description`, `barangay_id`, `collection_status`, `scheduled_date`, `created_at`, `collected_at`) VALUES
(1, 6, NULL, NULL, NULL, NULL, 'biodegradable', '[\"biodegradable\"]', NULL, NULL, 'Test submission', 14.60000000, 120.98000000, 'Test Address', 1, 'pending', NULL, '2026-03-03 00:53:05', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `idx_feedback_user` (`user_id`),
  ADD KEY `idx_feedback_created` (`created_at`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`location_id`),
  ADD KEY `idx_barangay` (`barangay_name`),
  ADD KEY `idx_municipality` (`municipality`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_read` (`is_read`),
  ADD KEY `idx_type` (`notification_type`),
  ADD KEY `fk_notification_schedule` (`schedule_id`);

--
-- Indexes for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_email_status` (`email`,`status`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `fk_prr_user` (`user_id`);

--
-- Indexes for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  ADD PRIMARY KEY (`tracking_id`),
  ADD KEY `idx_schedule` (`schedule_id`),
  ADD KEY `idx_collector` (`collector_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_planned_date` (`planned_date`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD KEY `idx_location` (`location_id`),
  ADD KEY `idx_day` (`collection_day`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `fk_schedule_creator` (`created_by`),
  ADD KEY `idx_waste_category` (`waste_category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_barangay` (`barangay_id`);

--
-- Indexes for table `waste_categories`
--
ALTER TABLE `waste_categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `uq_category_key` (`category_key`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `fk_category_creator` (`created_by`);

--
-- Indexes for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_collector` (`collector_id`),
  ADD KEY `idx_status` (`collection_status`),
  ADD KEY `idx_scheduled_date` (`scheduled_date`),
  ADD KEY `idx_barangay` (`barangay_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `feedback`
--
ALTER TABLE `feedback`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  MODIFY `tracking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `waste_categories`
--
ALTER TABLE `waste_categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `feedback`
--
ALTER TABLE `feedback`
  ADD CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `password_reset_requests`
--
ALTER TABLE `password_reset_requests`
  ADD CONSTRAINT `fk_prr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  ADD CONSTRAINT `fk_tracking_collector` FOREIGN KEY (`collector_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tracking_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `fk_schedule_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_schedule_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_schedule_waste_category` FOREIGN KEY (`waste_category_id`) REFERENCES `waste_categories` (`category_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL;

--
-- Constraints for table `waste_categories`
--
ALTER TABLE `waste_categories`
  ADD CONSTRAINT `fk_category_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  ADD CONSTRAINT `fk_submission_barangay` FOREIGN KEY (`barangay_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_submission_collector` FOREIGN KEY (`collector_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_submission_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
