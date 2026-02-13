-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 29, 2026 at 03:15 PM
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
(1, 'Barangay Poblacion', 'Sample Municipality', 'Sample Province', 'Zone 1', '2026-01-26 15:07:16'),
(2, 'Barangay San Jose', 'Sample Municipality', 'Sample Province', 'Zone 2', '2026-01-26 15:07:16'),
(3, 'Barangay Santa Maria', 'Sample Municipality', 'Sample Province', 'Zone 3', '2026-01-26 15:07:16');

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
  `is_read` tinyint(1) DEFAULT 0,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `status` enum('completed','missed','delayed') DEFAULT 'missed',
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
  `waste_type` enum('biodegradable','non-biodegradable','recyclable','mixed') NOT NULL DEFAULT 'mixed',
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`schedule_id`, `location_id`, `collection_day`, `collection_time`, `waste_type`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Monday', '08:00:00', 'biodegradable', 1, 1, '2026-01-26 15:07:16', '2026-01-26 15:07:16'),
(2, 1, 'Wednesday', '08:00:00', 'non-biodegradable', 1, 1, '2026-01-26 15:07:16', '2026-01-26 15:07:16'),
(3, 1, 'Friday', '08:00:00', 'recyclable', 1, 1, '2026-01-26 15:07:16', '2026-01-26 15:07:16'),
(4, 2, 'Tuesday', '09:00:00', 'biodegradable', 1, 1, '2026-01-26 15:07:16', '2026-01-26 15:07:16'),
(5, 2, 'Thursday', '09:00:00', 'non-biodegradable', 1, 1, '2026-01-26 15:07:16', '2026-01-26 15:07:16'),
(6, 3, 'Monday', '10:00:00', 'mixed', 1, 1, '2026-01-26 15:07:16', '2026-01-26 15:07:16'),
(7, 3, 'Thursday', '10:00:00', 'mixed', 1, 1, '2026-01-26 15:07:16', '2026-01-26 15:07:16');

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `full_name`, `role`, `phone_number`, `address`, `barangay_id`, `created_at`, `updated_at`, `is_active`) VALUES
(1, 'admin@wastesense.ph', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Administrator', 'admin', '09123456789', 'Admin Office', NULL, '2026-01-26 15:07:16', '2026-01-26 15:07:16', 1),
(2, 'admin2@wastesense.ph', '$2b$10$z8agH3KpWf9AymlrR6mn3.DI/ESjhM6jelEPEIuvUJXh9/7qvpNcq', 'Admin Two', 'admin', NULL, NULL, NULL, '2026-01-26 15:25:18', '2026-01-26 15:25:18', 1),
(3, 'user1@mail.com', '$2b$10$O6T5vkCdaHxnzJYldl.YP.TBi04QHJM0NnywVAnk4TCLdaACa6JMu', 'User One', 'resident', NULL, NULL, NULL, '2026-01-26 15:26:13', '2026-01-26 15:26:13', 1),
(4, 'collector@wastesense.com', '$2b$10$cxBg5j9mNJujb2Cm/rYIWufjv69bWhvhz5mC/lkf3AIuZ/llJwSrW', 'Collector One', 'collector', NULL, NULL, NULL, '2026-01-29 13:53:06', '2026-01-29 13:53:06', 1),
(5, 'admin@wastesense.com', '$2b$10$ucIpAHlUB59liYg0S5PnvefGNOFRJkO4Cz36OqxKdmgzBvbPTCsY2', 'Admin One', 'admin', NULL, NULL, NULL, '2026-01-29 13:54:05', '2026-01-29 13:54:05', 1);

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
  `confirmed_category` enum('biodegradable','non-biodegradable','recyclable','special','hazardous','mixed') DEFAULT NULL,
  `waste_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`waste_types`)),
  `waste_adjective` varchar(50) DEFAULT NULL,
  `waste_adjectives` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`waste_adjectives`)),
  `waste_description` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `address_description` text DEFAULT NULL,
  `barangay_id` int(11) DEFAULT NULL,
  `collection_status` enum('pending','scheduled','collected') DEFAULT 'pending',
  `scheduled_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `collected_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `waste_submissions`
--

INSERT INTO `waste_submissions` (`submission_id`, `user_id`, `collector_id`, `image_path`, `predicted_category`, `confirmed_category`, `waste_types`, `waste_adjective`, `waste_adjectives`, `waste_description`, `latitude`, `longitude`, `address_description`, `barangay_id`, `collection_status`, `scheduled_date`, `created_at`, `collected_at`) VALUES
(2, 3, 4, '/uploads/image_2026-01-29_221148886-1769695950966-305468072.png', 'biodegradable', NULL, '[\"biodegradable\"]', NULL, '[\"wet\"]', 'Detected as biodegradable waste with 95% confidence', 14.59814400, 121.00239400, NULL, 2, 'collected', NULL, '2026-01-29 14:12:30', '2026-01-29 14:13:32');

--
-- Indexes for dumped tables
--

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
  ADD KEY `schedule_id` (`schedule_id`);

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
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_barangay` (`barangay_id`);

--
-- Indexes for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_status` (`collection_status`),
  ADD KEY `idx_scheduled_date` (`scheduled_date`),
  ADD KEY `fk_waste_submission_collector` (`collector_id`);

--
-- AUTO_INCREMENT for dumped tables
--

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
-- AUTO_INCREMENT for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  MODIFY `tracking_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  MODIFY `submission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE SET NULL;

--
-- Constraints for table `performance_tracking`
--
ALTER TABLE `performance_tracking`
  ADD CONSTRAINT `performance_tracking_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `performance_tracking_ibfk_2` FOREIGN KEY (`collector_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`barangay_id`) REFERENCES `locations` (`location_id`) ON DELETE SET NULL;

--
-- Constraints for table `waste_submissions`
--
ALTER TABLE `waste_submissions`
  ADD CONSTRAINT `fk_waste_submission_collector` FOREIGN KEY (`collector_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `waste_submissions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
